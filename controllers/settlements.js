const db = require('../models')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const {Settlement, Schedule, User, Alarm, Participant, Sequelize} = db;
const Op = Sequelize.Op
const { toDate, isValidDate } = require('../utils/modules')
const {sendUnicastMessage}= require('../firebase');

exports.createSettlement = async (req, res) => {
  const {schedule_id, sender_id, receiver_id, amount}=req.body

  if(!schedule_id||!sender_id||!receiver_id||!amount){
    throw new BadRequestError('스케줄id, 정산액 입금자, 정산액 수급자, 정산 금액을 모두 입력하세요.')
  }
  
  const [settlement, created] = await Schedule.findOrCreate({
    where: { schedule_id, sender_id,receiver_id },
    defaults: {schedule_id, sender_id, receiver_id, amount}
  });

  if(!created){
    throw new BadRequestError('동일한 스케줄 내에 중복된 정산예정 내역이 존재합니다.')
  }

  res.status(StatusCodes.CREATED).json(settlement)
}

exports.settlementCheckRequest=async(req, res)=>{
  const {id} = req.body // 정산 id

  // id로 settlement 조회 후 sender_id와 req.user.id 비교
  const settlement = await Settlement.findByPk(id)

  if (settlement.sender_id!=req.user.id){
    throw new BadRequestError('정산액 입금자와 요청자의 id가 일치하지 않습니다.')
  }

  await Settlement.update(
    { is_paid: '확인중' },
    { where: id })

  const sender = await User.findByPk(settlement.sender_id)
  const receiver = await User.findByPk(settlement.receiver_id)

  // receiver_id에게 fcm push 전송
  if (receiver.device_token){
    await sendUnicastMessage({
      noitfication:{
        "title": "정산 확인 요청",
        "body": `${sender.name}님이 ${settlement.amount}원을 송금하여 확인 요청을 보냈습니다.`
      },
      data:{
        type:'정산 확인 요청'
      },
      token:receiver.device_token
    })
  }

  await Alarm.create({
    user_id:receiver.id,
    alarm_type:'정산 확인 요청', 
    message:`${sender.name}님이 ${settlement.amount}원을 송금하여 확인 요청을 보냈습니다.`
  })

  res.status(StatusCodes.OK).json({msg: "성공적으로 정산 확인 요청을 보냈습니다."})
}

exports.settlementCheck=async(req, res)=>{
  const {id} = req.body // 정산 id

  // id로 settlement 조회 후 sender_id와 req.user.id 비교
  const settlement = await Settlement.findByPk(id)

  if (settlement.receiver_id!=req.user.id){
    throw new BadRequestError('정산액 수급자와 요청자의 id가 일치하지 않습니다.')
  }

  const sender = await User.findByPk(settlement.sender_id)
  const receiver = await User.findByPk(settlement.receiver_id)

  // is_paid -> true
  await Settlement.update(
    { is_paid: '정산 완료' },
    { where: id })
    .then(async()=>{
      // sender_id에게 fcm push 전송
      if (sender.device_token) {
        await sendUnicastMessage({
          noitfication: {
            "title": "정산 확인 완료",
            "body": `${receiver.name}님이 정산 확인을 완료하였습니다!`
          },
          data: {
            type: '정산 확인 요청'
          },
          token: receiver.device_token
        })
      }

      await Alarm.create({
        user_id: receiver.id,
        alarm_type: '정산 확인 완료',
        message: `${receiver.name}님이 정산 확인을 완료하였습니다!`
      })

      res.status(StatusCodes.OK).json({ msg: "성공적으로 정산 확인 요청을 보냈습니다." })
    })

}

exports.getAllSettlements = async (req, res) => {
  const { schedule_id, sender_id, receiver_id, is_paid } = req.query;
  let condition = {}

  if (schedule_id) {
    condition.schedule_id = schedule_id
  }
  if (sender_id) {
    condition.sender_id = sender_id
  }
  if (receiver_id) {
    condition.receiver_id = receiver_id
  }
  if (is_paid) {
    condition.is_paid = is_paid
  }

  const settlements = await Settlement.findAll({ where: condition })
  if (!settlements.length) {
    throw new NotFoundError('정산 내역이 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(settlements)
};

exports.getSettlement = async (req, res) => {
  const { id } = req.params;

  const settlement = await Settlement.findByPk(id)

  if (!settlement) {
    throw new NotFoundError('정산 내역이 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(settlement)
};

exports.getSettlementsOfSchedule=async(req, res)=>{
  let {id} = req.user
  
  let result = [] 

  const settlements = await Schedule.findAll({
    include:[{
      model:Participant,
      where: {
        participant_id:id
      },
      attributes:[]
    },{
      model:Settlement,
      where:{
        [Op.or]:[{
          sender_id:id
        },{
          receiver_id:id
        }]
      },
      attributes:{
        exclude:['sender_id','receiver_id']
      },
      include: [{
        model: User,
        as: "sender",
        attributes: ['id','name', 'img_url']
      }, {
        model: User,
        as: "receiver",
        attributes: ['id','name', 'img_url']
      }],
    }]
  })

  settlements.forEach(s=>{
    
  })

  res.status(StatusCodes.OK).json(settlements)
}

exports.updateSettlement = async (req, res) => {
  const { id } = req.params;
  const { amount, is_paid, due_date}=req.body

  if (!id) {
    throw new BadRequestError('정산내역 id를 필수로 입력해야 합니다.')
  }

  if(due_date){
    due_date=toDate(due_date)
    if(!isValidDate(due_date)){
      throw new BadRequestError('')
    }
  }

  const result = await Settlement.update({
    amount, is_paid, due_date
  }, {
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `정산 내역이 성공적으로 업데이트되었습니다.` })
  } else {
    throw new NotFoundError('업데이트할 정산 내역이 존재하지 않습니다.')
  }
};

exports.restoreSettlement = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('정산 내역 id를 입력해주세요.');
  }

  const result = await Settlement.restore({
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `정산 내역이 성공적으로 복구되었습니다.` })
  } else {
    throw new NotFoundError('복구할 정산 내역이 존재하지 않습니다.')
  }
}

exports.deleteSettlement = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('물품 id를 입력해주세요.');
  }

  const result = await Settlement.destroy({
    where: { id },
    force:true
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `물품이 성공적으로 삭제되었습니다.` })
  } else {
    throw new NotFoundError('삭제할 물품 존재하지 않습니다.')
  }
};



