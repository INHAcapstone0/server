const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const Participant = db.Participant;
const Op = db.Sequelize.Op;

exports.createParticipant=async(req, res)=>{
  const {participant_id, schedule_id}=req.body

  if(!participant_id || !schedule_id){
    throw new BadRequestError('참여자 id와 스케줄 id를 모두 입력하세요.')
  }

  const [participant, created] = await Participant.findOrCreate({
    where: { participant_id, schedule_id },
    defaults: req.body
  })

  if(!created){
    throw new BadRequestError('중복된 참여자 정보가 존재합니다.')
  }

  res.status(StatusCodes.CREATED).json(participant)
}

exports.getAllParticipants = async (req, res) => {
  const {participant_id, schedule_id}= req.query;
  let condition={}

  if(participant_id){
    condition.participant_id=participant_id
  }
  if(schedule_id){
    condition.schedule_id=schedule_id
  }

  const participants= await Participant.findAll({
    where:condition
  })

  if(!participants.length){
    throw new NotFoundError('참여자 정보가 존재하지 않습니다.')
  }
  res.status(StatusCodes.OK).json(participants)
};

exports.restoreParticipant = async (req, res) => { // 삭제된 유저 복구
  const {participant_id, schedule_id}= req.body;

  if(!participant_id || !schedule_id){
    throw new BadRequestError('참여자 id와 스케줄 id를 모두 입력하세요.');
  }

  const result = await Participant.restore({
    where: { participant_id, schedule_id }
  })

  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`참여자 정보가 성공적으로 복구되었습니다.` })
  }else{
    throw new NotFoundError('복구할 유저가 존재하지 않습니다.')
  }
}

exports.deleteParticipant = async (req, res) => {
  const {participant_id, schedule_id}= req.body;

  if(!participant_id || !schedule_id){
    throw new BadRequestError('참여자 id와 스케줄 id를 모두 입력하세요.');
  }

  const result = await Participant.destroy({
    where: { participant_id, schedule_id }
  })

  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`참여자 정보가 성공적으로 삭제되었습니다.` })
  }else{
    throw new NotFoundError('삭제할 참여자 정보가 존재하지 않습니다.')
  }
};




