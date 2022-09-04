const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const Alarm = db.Alarm;
const Op = db.Sequelize.Op;

exports.createAlarm = async (req, res) => {
  const {user_id, alarm_type, message}=req.body

  if(!user_id||!alarm_type||!message){
    throw new BadRequestError('유저 ID, 알람 타입, 메세지 내용을 모두 지정해주세요.')
  }
  
  const item = await Alarm.create({
    user_id, alarm_type, message
  });

  res.status(StatusCodes.CREATED).json(item)
}

exports.getAllAlarms = async (req, res) => {
  const { alarm_type , user_id } = req.query;
  let condition={}

  if(alarm_type){
    condition.alarm_type=alarm_type
  }

  if(user_id){
    condition.user_id=user_id
  }

  const alarms= await Alarm.findAll({
      where:condition
  })

  if (!alarms.length) {
    throw new NotFoundError('알람이 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(alarms)
};

exports.getAlarm = async (req, res) => {
  const { id } = req.params;

  const alarm = await Alarm.findByPk(id)

  if (!alarm) {
    throw new NotFoundError('알람이 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(alarm)
};

exports.updateAlarm = async (req, res) => {
  const { id } = req.params;

  if (!id ) {
    throw new BadRequestError('알람 id를 필수로 입력해야 합니다.')
  }

  const result = await Alarm.update({
    checked:true
  }, {
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `알람이 성공적으로 업데이트되었습니다.` })
  } else {
    throw new NotFoundError('업데이트할 알람 존재하지 않습니다.')
  }
};

exports.restoreAlarm = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('알람 id를 입력해주세요.');
  }

  const result = await Alarm.restore({
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `알람이 성공적으로 복구되었습니다.` })
  } else {
    throw new NotFoundError('복구할 알람이 존재하지 않습니다.')
  }
}

exports.deleteAlarm = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('알람 id를 입력해주세요.');
  }

  const result = await Alarm.destroy({
    where: { id },
    force:true
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `알람이 성공적으로 삭제되었습니다.` })
  } else {
    throw new NotFoundError('삭제할 알람이 존재하지 않습니다.')
  }
};




