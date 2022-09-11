const { toDate, isValidDate } = require('../lib/modules');
const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const {Receipt, Participant} = db;
const Op = db.Sequelize.Op;

exports.createReceipt = async (req, res) => {
  let {
    schedule_id,
    poster_id,
    payDate,
    total_price,
    memo,
    place_of_payment,
    category
  } = req.body;

  if (!schedule_id || !poster_id ) {
    throw new BadRequestError('스케줄 id와 poster id를 필수로 입력해야 합니다.')
  }

  if (payDate) {
    payDate = toDate(payDate);
  }

  if (!isValidDate(payDate)) {
    throw new BadRequestError('구매 일자를 유효한 타입 [YYYYMMDDhhmmss]으로 입력하세요.')
  }

  const receipt = await Receipt.create({
    schedule_id, poster_id, payDate, total_price, memo, place_of_payment, category
  });

  const participants = await Participant.findAll({
    where: {schedule_id}
  })

  const poster=await User.findByPk(poster_id)

  if(!poster){
    throw new BadRequestError('유저가 존재하지 않습니다.')
  }

  let alarm_list=[]
  for (i of participants.map(participant=>participant.participant_id)){
    alarm_list.push({
      user_id:i, 
      alarm_type:'영수증 업로드', 
      message:`${poster.name}님이 새 영수증을 업로드하였습니다.`
    })
  }

  //FCM 푸쉬알람 보내기

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
  let { total_price, place_of_payment, memo, payDate, category } = req.body;

  if (payDate) {
    payDate = toDate(payDate);
  }

  if (!isValidDate(payDate)) {
    throw new BadRequestError('구매 일자를 유효한 타입 [YYYYMMDDhhmmss]으로 입력하세요.')
  }

  const result = await Receipt.update({
    total_price, place_of_payment, memo, payDate, category
  }, {
    where: { id }
  })
  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `영수증이 성공적으로 업데이트되었습니다.` })
  } else {
    throw new NotFoundError('업데이트할 영수증이 존재하지 않습니다.')
  }
};

exports.uploadReceiptImage=async(req, res)=>{
  const {id} = req.params;

  const img_url=req.file.location

  if(!img_url){
    throw new BadRequestError('파일 저장 중 오류가 발생했습니다.')
  }

  const result = await Receipt.update({img_url}, {
    where: {id}
  })

  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`영수증 이미지가 성공적으로 업데이트되었습니다.` })
  }else{
    throw new NotFoundError('업데이트할 영수증이 존재하지 않습니다.')
  }
}

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
    where: { id },
    force:true
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `영수증이 성공적으로 삭제되었습니다.` })
  } else {
    throw new NotFoundError('삭제할 영수증이 존재하지 않습니다.')
  }
};




