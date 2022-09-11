const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const {Participant, Alarm, Schedule} = db;

exports.createParticipant = async (req, res) => {
  const { participant_id, schedule_id } = req.body

  if (!participant_id || !schedule_id) {
    throw new BadRequestError('참여자 id와 스케줄 id를 모두 입력하세요.')
  }

  const schedule= await Schedule.findOne({
    where:{id:schedule_id}
  })

  if(!schedule){
    throw new BadRequestError('스케줄 정보가 존재하지 않습니다.')
  }

  const [participant, created] = await Participant.findOrCreate({
    where: { participant_id, schedule_id },
    defaults: { participant_id, schedule_id }
  })

  if (!created) {
    throw new BadRequestError('중복된 참여자 정보가 존재합니다.')
  }

  await Alarm.create({
    user_id:participant_id, 
    alarm_type:'초대', 
    message:`${req.user.name}님이 ${schedule.name} 일정에 당신을 초대했습니다.`
  })

  //FCM으로 유저에게 초대 알람 보내기

  res.status(StatusCodes.CREATED).json(participant)
}

exports.getAllParticipants = async (req, res) => {
  const { participant_id, schedule_id, status } = req.query;
  let condition = {}

  if (participant_id) {
    condition.participant_id = participant_id
  }
  if (schedule_id) {
    condition.schedule_id = schedule_id
  }
  if(status){
    condition.status=status
  }

  const participants = await Participant.findAll({
    where: condition
  })

  if (!participants.length) {
    throw new NotFoundError('참여자 정보가 존재하지 않습니다.')
  }
  res.status(StatusCodes.OK).json(participants)
};

exports.updateParticipant = async (req, res) => {
  const { participant_id, schedule_id } = req.params;
  let { status }=req.body;

  if(!participant_id||!schedule_id || !status){
    throw new BadRequestError('참여자 id와 스케줄id, 변경할 status를 입력해주세요.')
  }
  
  const result = await Participant.update({status}, {
    where: {participant_id, schedule_id}
  })
  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`참여자 정보 상태가 성공적으로 업데이트되었습니다.` })
  }else{
    throw new NotFoundError('업데이트할 참여자 정보 상태가 존재하지 않습니다.')
  }
};

exports.restoreParticipant = async (req, res) => { // 삭제된 유저 복구
  const { participant_id, schedule_id } = req.params;

  if (!participant_id || !schedule_id) {
    throw new BadRequestError('참여자 id와 스케줄 id를 모두 입력하세요.');
  }

  const result = await Participant.restore({
    where: { participant_id, schedule_id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `참여자 정보가 성공적으로 복구되었습니다.` })
  } else {
    throw new NotFoundError('복구할 유저가 존재하지 않습니다.')
  }
}

exports.deleteParticipant = async (req, res) => {
  const { participant_id, schedule_id } = req.params;

  if (!participant_id || !schedule_id) {
    throw new BadRequestError('참여자 id와 스케줄 id를 모두 입력하세요.');
  }

  const result = await Participant.destroy({
    where: { participant_id, schedule_id },
    force:true
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `참여자 정보가 성공적으로 삭제되었습니다.` })
  } else {
    throw new NotFoundError('삭제할 참여자 정보가 존재하지 않습니다.')
  }
};




