const { toDate, isValidDate } = require('../lib/modules');
const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const User = db.User;
const Schedule = db.Schedule;
const Participant = db.Participant;
const Op = db.Sequelize.Op;

//추후에 기간 중복에 대한 유효성 검증할 것
exports.createSchedule = async (req, res) => {
  let {
    name,
    owner_id,
    startAt, // yyyymmddhhmmss
    endAt // yyyymmddhhmmss
  } = req.body;

  if (!name || !owner_id || !startAt || !endAt) {
    throw new BadRequestError('모든 값을 입력해주세요.')
  }

  startAt = toDate(startAt);
  endAt = toDate(endAt);
  
  if (!isValidDate(startAt) && !isValidDate(endAt)) {
    throw new BadRequestError('일정 시작일과 종료일을 유효한 타입 [YYYYMMDDhhmmss]으로 입력하세요.')
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

  res.status(StatusCodes.CREATED).json(schedule)
}

exports.getAllSchedules = async(req, res) => {
  const {owner_name, name, owner_id, participant_id}=req.query;
  let nested_condition={}
  let condition={}
  let schedules
  let include=[]

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
      where:{ [Op.like]: `%${owner_name}%` },
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
    
  schedules= await Schedule.findAll({
    where:condition,
    include
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

  const schedule = await Schedule.findByPk(id)

  if(!schedule){
    throw new NotFoundError('스케줄이 존재하지 않습니다.')
  }
  res.status(StatusCodes.OK).json(schedule)
};

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

  const result = await Schedule.destroy({
    where: { id }
  })

  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`스케줄이 성공적으로 삭제되었습니다.` })
  }else{
    throw new NotFoundError('삭제할 스케줄이 존재하지 않습니다.')
  }
};


