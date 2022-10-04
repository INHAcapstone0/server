const { param } = require('express/lib/router');
const { UnauthenticatedError, BadRequestError } = require('../errors')
const db = require('../models');
const { Receipt, Schedule, Alarm, Settlement, Participant } = db;

// Participant request의 리소스에 접근 권한이 있는지 확인
const accessableToParticipantRequest = async (req, res, next) => {
  if (req.user.admin) { // 관리자라면 미들웨어 패싱
    return next()
  }

  const { schedule_id, participant_id } = req.params

  // param의 schedule_id로 schedule owner 조회
  if (schedule_id && participant_id) {
    const { owner_id } = await Schedule.findOne({
      where: { id: schedule_id }
    })
    // 요청자가 참여자 본인이거나 참가한 스케줄 소유자가 아니라면
    if (!([owner_id, participant_id].includes(req.user.id))) {
      throw new UnauthenticatedError('해당 데이터에 대한 요청의 권한이 없습니다.')
    }
  }
  return next()
}

// Receipt request의 리소스에 접근 권한이 있는지 확인
const accessableToReceiptRequest = async (req, res, next) => {
  if (req.user.admin) { // 관리자라면 미들웨어 패싱
    return next()
  }

  const { id } = req.params

  // param의 id로 Receipt 조회
  if (id) {
    const receipt = await Receipt.findOne({
      where: { id },
      include: [{
        model: Schedule,
        attributes: ['owner_id']
      }]
    })

    console.log(receipt.Schedule.owner_id, receipt.poster_id)
    // 요청자가 영수증 게시자이거나 영수증이 속한 스케줄 소유자가 아니라면
    if (!(req.user.id == receipt.Schedule.owner_id || req.user.id == receipt.poster_id)) {
      throw new UnauthenticatedError('해당 데이터에 대한 요청의 권한이 없습니다.')
    }
  }
  return next()
}

// Schedule request의 리소스에 접근 권한이 있는지 확인
const accessableToScheduleRequest = async (req, res, next) => {
  if (req.user.admin) { // 관리자라면 미들웨어 패싱
    return next()
  }

  const { id } = req.params

  // param의 id로 Schedule 조회
  if (id) {
    const schedule = await Schedule.findOne({
      where: { id }
    })

    // 요청자가 스케줄 소유자가 아니라면
    if (!schedule || req.user.id != schedule.owner_id) {
      throw new UnauthenticatedError('해당 데이터에 대한 요청의 권한이 없습니다.')
    }
  }
  return next()
}

const readableToScheduleRequest = async (req, res, next) => {
  if (req.user.admin) { // 관리자라면 미들웨어 패싱
    return next()
  }

  const { id } = req.params

  // param의 id로 Schedule 조회
  if(!id){
    throw new UnauthenticatedError('해당 데이터에 대한 요청의 권한이 없습니다.')
  }

  const participants = await Participant.findAll({
    include:[{
      model:Schedule,
      where:{id},
      attributes:[]
    }]
  })

  let participant_list=[]
  participants.forEach(p=>participant_list.push(p.participant_id))
  
  if (!(participant_list.includes(req.user.id))){
    throw new UnauthenticatedError('해당 데이터에 대한 요청의 권한이 없습니다.')
  }
  else{
    return next()
  }
}


// Alarm request의 리소스에 접근 권한이 있는지 확인
const accessableToAlarmRequest = async (req, res, next) => {
  if (req.user.admin) { // 관리자라면 미들웨어 패싱
    return next()
  }

  const { id } = req.params

  // param의 id로 Alarm 조회
  if (id) {
    const { user_id } = await Alarm.findOne({
      where: { id }
    })

    // 요청자가 스케줄 소유자가 아니라면
    if (req.user.id != user_id) {
      throw new UnauthenticatedError('해당 데이터에 대한 요청의 권한이 없습니다.')
    }
  }
  return next()
}

// User request의 리소스에 접근 권한이 있는지 확인
const accessableToUserRequest = async (req, res, next) => {
  if (req.user.admin) { // 관리자라면 미들웨어 패싱
    return next()
  }

  const { id } = req.params

  // 요청자의 id와 조회할 리소스id가 일치하지 않는다면
  if (req.user.id != id) {
    throw new UnauthenticatedError('해당 데이터에 대한 요청의 권한이 없습니다.')
  }
  return next()
}

// Settlement request의 리소스에 접근 권한이 있는지 확인
const accessableToSettlementRequest = async (req, res, next) => {
  if (req.user.admin) { // 관리자라면 미들웨어 패싱
    return next()
  }

  const { id } = req.params

  const settlement = await Settlement.findOne({
    where: { id }
  })
  // 요청자의 id와 조회할 리소스id가 일치하지 않는다면
  if (req.user.id != settlement.receiver_id) {
    throw new UnauthenticatedError('해당 데이터에 대한 요청의 권한이 없습니다.')
  }
  return next()
}


module.exports = {
  accessableToAlarmRequest,
  accessableToParticipantRequest,
  accessableToReceiptRequest,
  accessableToScheduleRequest,
  accessableToUserRequest,
  accessableToSettlementRequest,
  readableToScheduleRequest
}