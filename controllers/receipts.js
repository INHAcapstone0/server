const { toDate, isValidDate } = require('../lib/modules');
const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const Receipt = db.Receipt;
const Op = db.Sequelize.Op;

exports.createReceipt = async (req, res) => {
  let {
    schedule_id,
    poster_id,
  } = req.body;

  if (!schedule_id || !poster_id) {
    throw new BadRequestError('스케줄 id와 poster id를 필수로 입력해야 합니다.')
  }

  if (req.body.payDate) {
    req.body.payDate = toDate(req.body.payDate);
  }

  if (!isValidDate(req.body.payDate)) {
    throw new BadRequestError('구매 일자를 유효한 타입 [YYYYMMDDhhmmss]으로 입력하세요.')
  }

  const receipt = await Receipt.create(req.body);

  res.status(StatusCodes.CREATED).json(receipt)
}

exports.getAllReceipts = async (req, res) => {
  const { schedule_id, poster_id, place_of_payment, max_total_price, min_total_price } = req.query;
  let condition = {}

  if (schedule_id) {
    condition.schedule_id = schedule_id
  }
  if (poster_id) {
    condition.schedule_id = poster_id
  }
  if (place_of_payment) {
    condition.schedule_id = { [Op.like]: `%${place_of_payment}%` }
  }

  let min = 0,
    max = 10000000
  if (max_total_price) {
    max = Math.max(max, max_total_price)
  } if (min_total_price) {
    min = Math.min(min, min_total_price)
  }

  condition.total_price = { [Op.between]: [min, max] }

  const receipts = await Receipt.findAll({ where: condition })
  if (!receipts.length) {
    throw new NotFoundError('영수증이 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(receipts)
};

exports.getReceipt = async (req, res) => {
  const { id } = req.params;

  const receipt = await Receipt.findByPk(id)

  if (!receipt) {
    throw new NotFoundError('영수증이 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(receipt)
};

exports.updateReceipt = async (req, res) => {
  const { id } = req.params;
  const { total_price, place_of_payment, memo, payDate } = req.body;

  if (payDate) {
    payDate = toDate(payDate);
  }

  if (!isValidDate(payDate)) {
    throw new BadRequestError('구매 일자를 유효한 타입 [YYYYMMDDhhmmss]으로 입력하세요.')
  }

  const result = await Receipt.update({
    total_price, place_of_payment, memo, payDate
  }, {
    where: { id }
  })
  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `영수증이 성공적으로 업데이트되었습니다.` })
  } else {
    throw new NotFoundError('업데이트할 영수증이 존재하지 않습니다.')
  }
};

exports.restoreReceipt = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('영수증 id를 입력해주세요.');
  }

  const result = await Receipt.restore({
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `영수증이 성공적으로 복구되었습니다..` })
  } else {
    throw new NotFoundError('복구할 영수증이 존재하지 않습니다.')
  }
}

exports.deleteReceipt = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('영수증 id를 입력해주세요.');
  }

  const result = await Receipt.destroy({
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `영수증이 성공적으로 삭제되었습니다.` })
  } else {
    throw new NotFoundError('삭제할 영수증이 존재하지 않습니다.')
  }
};




