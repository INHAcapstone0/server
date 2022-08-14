const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const Participant = db.Participant;
const Schedule = db.Schedule;
const Op = db.Sequelize.Op;

exports.createParticipant = async (req, res) => {
  const { participant_id, schedule_id } = req.body

  if (!participant_id || !schedule_id) {
    throw new BadRequestError('참여자 id와 스케줄 id를 모두 입력하세요.')
  }

  const beforeCreate= await Participant.findAll({
    include:[{
      model:Schedule,
      where:{
        id:schedule_id,
        owner_id:participant_id
      }
    }]
  })

  if(beforeCreate.length){ // owner_id와 동일한 participant_id를 등록하려고 할 때 예외처리
    throw new BadRequestError('스케줄 생성자는 참여자 정보로 생성할 수 없습니다.');
  }
  
  const [participant, created] = await Participant.findOrCreate({
    where: { participant_id, schedule_id },
    defaults: { participant_id, schedule_id }
  })

  if (!created) {
    throw new BadRequestError('중복된 참여자 정보가 존재합니다.')
  }

  res.status(StatusCodes.CREATED).json(participant)
}

exports.getAllParticipants = async (req, res) => {
  const { participant_id, schedule_id } = req.query;
  let condition = {}

  if (participant_id) {
    condition.participant_id = participant_id
  }
  if (schedule_id) {
    condition.schedule_id = schedule_id
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
  const { participant_id, schedule_id } = req.body;

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
  const { participant_id, schedule_id } = req.body;

  if (!participant_id || !schedule_id) {
    throw new BadRequestError('참여자 id와 스케줄 id를 모두 입력하세요.');
  }

  const result = await Participant.destroy({
    where: { participant_id, schedule_id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `참여자 정보가 성공적으로 삭제되었습니다.` })
  } else {
    throw new NotFoundError('삭제할 참여자 정보가 존재하지 않습니다.')
  }
};




