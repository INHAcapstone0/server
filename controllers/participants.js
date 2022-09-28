const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const {Participant, Alarm, Schedule, User} = db;

exports.createParticipant = async (req, res) => {
  const { participant_ids, schedule_id } = req.body

  if (!participant_ids || !schedule_id) {
    throw new BadRequestError('참여자 id와 스케줄 id를 모두 입력하세요.')
  }

  const schedule= await Schedule.findOne({
    where:{id:schedule_id}
  })

  if(!schedule){
    throw new BadRequestError('스케줄 정보가 존재하지 않습니다.')
  }

  let participant_list=[]
  let alarm_list=[]

  if (Array.isArray(participant_ids)) {
    participant_ids.forEach(participant => {
      participant_list.push({
        participant_id: participant,
        schedule_id
      })

      alarm_list.push({
        user_id:participant, 
        alarm_type:'초대', 
        message:`${req.user.name}님이 "${schedule.name}" 일정에 당신을 초대했습니다.`
      })
    })
  }else{
    throw new BadRequestError('참여자 정보를 Array 형태로 입력하세요.')
  }

  const participants = await Participant.bulkCreate(participant_list)

  await Alarm.bulkCreate(alarm_list)
  
  //FCM으로 유저에게 초대 알람 보내기
  let token_list=[]
  
  const users = await User.findAll({
    where:{
      id:{
        [Op.in] : participant_ids
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
        "body": `${req.user.name}님이 "${schedule.name}" 일정에 당신을 초대했습니다.`
      },
      data: {
        type: '초대'
      },
      tokens: token_list,
    })
  }

  res.status(StatusCodes.CREATED).json(participants)
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
    where: condition,
    include:[{
      model:User,
      attributes:['img_url', 'name']
    }],
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




