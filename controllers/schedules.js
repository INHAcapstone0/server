const { toDate, isValidDate } = require('../utils/modules');
const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const {User, Schedule, Participant, Receipt, Alarm, Sequelize} = db;
const Op = Sequelize.Op
const scheduler=require('../utils/node-scheduler')
const {sendMulticastMessage}= require('../firebase')

//추후에 기간 중복에 대한 유효성 검증할 것
exports.createSchedule = async (req, res) => {
  let {
    name,
    owner_id,
    startAt, // yyyymmdd
    endAt, // yyyymmdd
    participants
  } = req.body;

  if (!name || !owner_id || !startAt || !endAt) {
    throw new BadRequestError('모든 값을 입력해주세요.')
  }

  startAt = toDate(startAt);
  endAt = toDate(endAt);
  
  if (!isValidDate(startAt) && !isValidDate(endAt)) {
    throw new BadRequestError('일정 시작일과 종료일을 유효한 타입 [YYYYMMDD]으로 입력하세요.')
  } else if (startAt >= endAt) {
    throw new BadRequestError('일정 종료시간을 일정 시작시간 이후의 날짜로 입력하세요.')
  }

  const user = await User.findByPk(owner_id)
  if (!user) {
    throw new NotFoundError('소유자 id를 가진 유저가 존재하지 않습니다.')
  }

  // 중복된 스케줄이 존재하면 created를 반환
  const [schedule, created] = await Schedule.findOrCreate({
    where: { owner_id, name },
    defaults: {owner_id, name, startAt, endAt}
  });
  
  if(!created){
    throw new BadRequestError('해당 소유자가 이미 생성한 같은 이름의 스케줄이 존재합니다.')
  }

  // 최초 참여자 리스트는 소유주 
  let participant_list=[{
    participant_id:owner_id,
    schedule_id:schedule.id,
    status:'승인'
  }]

  let alarm_list=[]

  if (Array.isArray(participants)) {
    participants.forEach(participant => {
      participant_list.push({
        participant_id: participant,
        schedule_id: schedule.id
      })

      alarm_list.push({
        user_id:participant, 
        alarm_type:'초대', 
        message:`${user.name}님이 "${name}" 일정에 당신을 초대했습니다.`
      })
    })
  }else{
    throw new BadRequestError('참여자 정보를 Array 형태로 입력하세요.')
  }

  await Participant.bulkCreate(participant_list)

  if (alarm_list.length!=0){
    await Alarm.bulkCreate(alarm_list)
  }

  //scheduler 등록
  scheduler.createOrFixScheduler(schedule)

  //FCM으로 유저에게 초대 알람 보내기
  let token_list=[]
  
  const users = await User.findAll({
    where:{
      id:{
        [Op.in] : participants
      }
    }
  })

  users.forEach(user=>{
    if (user.device_token){
      token_list.push(user.device_token)
    }
  })

  if (token_list.legnth != 0) {
    await sendMulticastMessage({
      notification: {
        "title": "새 일정 초대",
        "body": `${user.name}님이 "${name}" 일정에 당신을 초대했습니다.`
      },
      data: {
        type: '초대'
      },
      tokens: token_list,
    })
  }
  
  res.status(StatusCodes.CREATED).json(schedule)
}

exports.getAllSchedules = async(req, res) => {
  const {owner_name, name, owner_id, participant_id}=req.query;
  let condition={}

  console.log(req.user)
  // 스케줄에 속해 있는 모든 영수증의 total_price 합을 조회하기 위한 join
  let include=[{
    model:Receipt,
    attributes:[]
  }]

  if(name){
    condition.name= { [Op.like]: `%${name}%` };
  }

  if(owner_id){
    condition.owner_id= owner_id;
  }

  // owner_name으로 조회할 때
  if(owner_name){
    include.push({
      model: User,
      where:{ name:{[Op.like]: `%${owner_name}%`}},
      attributes:[] // join한 객체 숨기기
    })
  }

  if(participant_id){
    include.push({
      model: Participant,
      where:{ participant_id },
      attributes:[] // join한 객체 숨기기
    })
  }
   
  const schedules= await Schedule.findAll({
    where:condition,
    attributes:{ // 스케줄에 속해 있는 모든 영수증의 total_price 합을 추가
      include:[[Sequelize.fn('sum',Sequelize.col('receipts.total_price')), 'total_pay']]
    },
    include,
    group:['id']
  })

  if(!schedules.length){
    throw new NotFoundError('스케줄이 존재하지 않습니다.')
  }
  res.status(StatusCodes.OK).json(schedules);
};

exports.getSchedule = async (req, res) => {
  const { id } = req.params;
  if(!id){
    throw new BadRequestError('스케줄 id를 입력해주세요.');
  }
  
  const schedule= await Schedule.findOne({
    where:{id},
    attributes:{ // 스케줄에 속해 있는 모든 영수증의 total_price 합을 추가
      include:[[Sequelize.fn('sum',Sequelize.col('receipts.total_price')), 'total_pay']]
    },
    include:[{
      model:Receipt,
      attributes:[]
    }],
    group:['id']
  })

  if(!schedule){
    throw new NotFoundError('스케줄이 존재하지 않습니다.')
  }
  res.status(StatusCodes.OK).json(schedule)
};

exports.getMyApprovedSchedule = async(req, res)=>{
  // 나의 user id를 가져오기 
  const {id}= req.user
  const {status} = req.query;
  // participant_id가 나의 user id와 일치하는 것 중 status=승인인 데이터를 schedule과 include해서 가져오기
  const results= await Participant.findAll({
    where : {
      participant_id:id,
      status
    }
  })

  if(!results.length){
    throw new NotFoundError('스케줄이 존재하지 않습니다.')
  }

  const schedule_ids =[]

  results.forEach(result=>{
    schedule_ids.push(result.schedule_id)
  })

  const schedules= await Schedule.findAll({
    where:{
      id:{
        [Op.in]:schedule_ids
      }
    },
    attributes:{ // 스케줄에 속해 있는 모든 영수증의 total_price 합을 추가
      include:[[Sequelize.fn('sum',Sequelize.col('receipts.total_price')), 'total_pay']]
    },
    include:[{
      model:Receipt,
      attributes:[]
    }],
    group:['id']
  })
  
  res.status(StatusCodes.OK).json(schedules)
}

//update 시 기간 및 name validation 나중에 추가
exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { name, startAt, endAt } = req.body;

  if(!id){
    throw new BadRequestError('스케줄 id를 입력해주세요.');
  }
  //업데이트 전 상태

  const beforeUpdateSchedule= await Schedule.findByPk(id)

  const afterUpdateSchedule=await Schedule.findOne({
    where:{
      id:{[Op.ne]:id},
      name:name || beforeUpdateSchedule.name,
      owner_id:beforeUpdateSchedule.owner_id
    }
  })
  
  if(!afterUpdateSchedule){
    throw new BadRequestError('해당 소유자가 이미 생성한 같은 이름의 스케줄이 존재합니다.')
  }

  const result= await Schedule.update({ name, startAt, endAt }, {
    where: {id}
  })

  if(result==1){
    //scheduler 수정
    scheduler.createOrFixScheduler(afterUpdateSchedule)
    res.status(StatusCodes.OK).json({msg:"스케줄이 수정되었습니다."})
  }else{
    throw new NotFoundError(`스케줄 id가 ${id}인 스케줄을 찾을 수 없습니다.`)
  }
}

exports.restoreSchedule = async (req, res) => { // 삭제된 유저 복구
  const { id } = req.params;
  if(!id){
    throw new BadRequestError('스케줄 id를 입력해주세요.');
  }
  const result = await Schedule.restore({
    where: { id }
  })

  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`스케줄이 성공적으로 복구되었습니다..` })
  }else{
    throw new NotFoundError('복구할 스케줄이 존재하지 않습니다.')
  }
}

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;

  if(!id){
    throw new BadRequestError('스케줄 id를 입력해주세요.');
  }

  const schedule=await Schedule.findByPk(id)

  const result = await Schedule.destroy({
    where: { id },
    force:true
  })

  if(result==1){
    //scheduler 삭제
    scheduler.deleteScheduler(schedule)
    res.status(StatusCodes.OK).json({ msg:`스케줄이 성공적으로 삭제되었습니다.` })
  }else{
    throw new NotFoundError('삭제할 스케줄이 존재하지 않습니다.')
  }
};


