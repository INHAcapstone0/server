const db = require('../models')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const Settlement = db.Settlement
const Schedule=db.Schedule
const Op = db.Sequelize.Op
const { toDate, isValidDate } = require('../lib/modules')

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
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `물품이 성공적으로 삭제되었습니다.` })
  } else {
    throw new NotFoundError('삭제할 물품 존재하지 않습니다.')
  }
};




