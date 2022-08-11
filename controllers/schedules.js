const { toDate, isValidDate } = require('../lib/modules');
const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const User = db.User;
const Schedule = db.Schedule;
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

  req.body.startAt = toDate(req.body.startAt);
  req.body.endAt = toDate(req.body.endAt);
  
  if (!isValidDate(req.body.startAt) && !isValidDate(req.body.endAt)) {
    throw new BadRequestError('일정 시작일과 종료일을 유효한 타입 [YYYYMMDDhhmmss]으로 입력하세요.')
  } else if (req.body.startAt >= req.body.endAt) {
    throw new BadRequestError('일정 종료시간을 일정 시작시간 이후의 날짜로 입력하세요.')
  }

  const user = await User.findByPk(owner_id)
  if (!user) {
    throw new NotFoundError('소유자 id를 가진 유저가 존재하지 않습니다.')
  }

  // 중복된 스케줄이 존재하면 created를 반환
  const [schedule, created] = await Schedule.findOrCreate({
    where: { owner_id, name },
    defaults: req.body
  });
  
  if(!created){
    throw new BadRequestError('해당 소유자가 이미 생성한 같은 이름의 스케줄이 존재합니다.')
  }

  res.status(StatusCodes.CREATED).json(schedule)
}

exports.getAllSchedules = async(req, res) => {
  const {owner_name, name, owner_id}=req.query;
  const condition={}
  let schedules;

  // owner_name과 id으로 조회할 때
  if(owner_name||owner_id){
    if(owner_name){
      condition.name= { [Op.like]: `%${owner_name}%` };
    }
    if(owner_id){
      condition.id= owner_id;
    }
    schedules= await Schedule.findAll({
      include: [{
        model: Schedule,
        where:condition,
        attributes:[] // join한 객체 숨기기
      }],
    })
  }else{
    if(name){
      condition.name= { [Op.like]: `%${name}%` };
    }
    schedules= await Schedule.findAll({
      where:condition
    });
  }
  if(!schedules.length){
    throw new NotFoundError('스케줄이 존재하지 않습니다.')
  }
  res.status(StatusCodes.OK).json(schedules);
  // owner_name없이 조회할 때
};

exports.getSchedule = async (req, res) => {
  const { id } = req.params;
  const schedule = await Schedule.findByPk(id)

  if(!schedule){
    throw new NotFoundError('스케줄이 존재하지 않습니다.')
  }
  res.status(StatusCodes.OK).json(schedule)
};

//update 시 기간 및 name validation 나중에 추가
exports.updateSchedule = async (req, res) => {
  const { id } = req.params;

  //업데이트 전 상태
  const beforeUpdateSchedule= await Schedule.findByPk(id)

  const afterUpdateSchedule=await Schedule.findAll({
    where:{
      id:{[Op.ne]:beforeUpdateSchedule.id},
      name:req.body.name,
      owner_id:beforeUpdateSchedule.owner_id
    },
    limit:1
  })
  
  if(afterUpdateSchedule.length!=0){
    throw new BadRequestError('해당 소유자가 이미 생성한 같은 이름의 스케줄이 존재합니다.')
  }

  const result= await Schedule.update(req.body, {
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



