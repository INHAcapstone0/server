const { toDate, isValidDate, toFullDate } = require('../utils/modules');
const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors');
const { Receipt, Participant, User, Alarm } = db;
const Op = db.Sequelize.Op;
const { sendMulticastMessage } = require('../firebase')
const fs = require('fs')
const FormData = require("form-data");
const path = require('path')
const axios = require('axios')
const { deleteS3 } = require('../middleware/s3')

exports.createReceipt = async (req, res) => {
  let {
    schedule_id,
    poster_id,
    payDate,
    total_price,
    memo,
    place,
    address,
    category
  } = req.body;

  if (!schedule_id || !poster_id) {
    throw new BadRequestError('스케줄 id와 poster id를 필수로 입력해야 합니다.')
  }

  if (payDate) {
    payDate = toFullDate(payDate);
    if (!isValidDate(payDate)) {
      throw new BadRequestError('구매 일자를 유효한 타입 [YYYYMMDDhhmmss]으로 입력하세요.')
    }
  }

  const poster = await Participant.findOne({
    where: {
      participant_id: poster_id,
      schedule_id
    },
    include: [{
      model: User,
      attributes: ['name']
    }],
  })

  if (!poster) {
    throw new BadRequestError('영수증 게시자가 해당 스케줄의 참가자 내에 존재하지 않습니다.')
  }

  const receipt = await Receipt.create({
    schedule_id, poster_id, payDate, total_price, memo, place, address, category
  });

  const participants = await Participant.findAll({
    where: { schedule_id }
  })

  let alarm_list = []
  let participant_ids = []
  for (i of participants.map(participant => participant.participant_id)) {
    participant_ids.push(i)
    alarm_list.push({
      user_id: i,
      alarm_type: '영수증 업로드',
      message: `${poster.User.name}님이 새 영수증을 업로드하였습니다.`
    })
  }

  if (alarm_list.length != 0) {
    await Alarm.bulkCreate(alarm_list)
  }

  //FCM 푸쉬알람 보내기
  let token_list = []

  const users = await User.findAll({
    where: {
      id: {
        [Op.in]: participant_ids
      }
    }
  })

  users.forEach(user => {
    if (user.device_token) {
      token_list.push(user.device_token)
    }
  })

  if (token_list.legnth != 0) {
    await sendMulticastMessage({
      notification: {
        "title": '영수증 업로드',
        "body": `${poster.User.name}님이 새 영수증을 업로드하였습니다.`
      },
      data: {
        type: '영수증 업로드'
      },
      tokens: token_list,
    })
  }

  res.status(StatusCodes.CREATED).json(receipt)
}

exports.getAllReceipts = async (req, res) => {
  const { schedule_id, poster_id, place_of_payment, max_total_price, min_total_price, category } = req.query;
  let condition = {}

  if (schedule_id) {
    condition.schedule_id = schedule_id
  }
  if (poster_id) {
    condition.poster_id = poster_id
  }
  if (place_of_payment) {
    condition.place_of_payment = { [Op.like]: `%${place_of_payment}%` }
  }
  if (category) {
    condition.category = category
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

exports.uploadReceiptImage = async (req, res) => {
  const { id } = req.params;

  const img_url = req.file.location

  if (!img_url) {
    throw new BadRequestError('파일 저장 중 오류가 발생했습니다.')
  }

  const receipt = await Receipt.findByPk(id)

  // 기존에 저장된 영수증 이미지 삭제
  if (receipt.img_url) {
    deleteS3(receipt.img_url)
  }

  const result = await Receipt.update({ img_url }, {
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `영수증 이미지가 성공적으로 업데이트되었습니다.` })
  } else {
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
    force: true
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `영수증이 성공적으로 삭제되었습니다.` })
  } else {
    throw new NotFoundError('삭제할 영수증이 존재하지 않습니다.')
  }
};

exports.test = async (req, res) => {
  try {
    const filePath = path.join(__dirname + "/../" + req.file.path)
    console.log(filePath)
    const api_url = process.env.CLOVA_URI
    //1. file 읽기
    let form = new FormData();
    form.append(
      "file",
      fs.createReadStream(filePath)
    );

    form.append(
      "message",
      JSON.stringify({ "images": [{ "format": "jpeg", "name": "sample" }], "requestId": "capstone", "version": "V2", "timestamp": 0 })
    )

    //2. CLOVA 전송
    const targetParceData = await axios
      .post(api_url, form, {
        headers: {
          ...form.getHeaders(),
          'X-OCR-SECRET': process.env.X_OCR_SECRET,
        },
      })

    let ocr_result = {
      items: []
    }

    let target_store = {}

    let parceData = targetParceData.data.images[0].receipt.result

    let { paymentInfo, storeInfo, subResults, totalPrice } = parceData

    if (paymentInfo) {
      ocr_result.payDate = Object.assign({}, (paymentInfo?.date?.formatted || {}), (paymentInfo?.time?.formatted || {}))
    }
    else {
      ocr_result.payDate = null
    }

    ocr_result.store = {
      name: storeInfo.name.formatted.value || storeInfo.subName.formatted.value,
      addresses: storeInfo.addresses[0].text,
      tel: '',
      category:''
    }

    fs.writeFileSync(__dirname+`/../data/${Date.now().toString()}_${ocr_result.store.name}.json`, JSON.stringify(parceData))
    if (storeInfo.tel) {
      ocr_result.store.tel = storeInfo.tel[0].formatted.value
    }

    ocr_result.store.name = ocr_result.store.name.replace('(주)', '')

    if (subResults.length != 0) {
      subResults[0].items.forEach(r => {
        ocr_result.items.push({
          name: r.name.text,
          count: parseInt(r.count?.formatted.value || '1'),
          price: parseInt(r.price?.price.formatted.value || '0')
        })
      })
    }

    ocr_result.totalPrice = parseInt(totalPrice?.price?.formatted.value||'0')

    //1. store.address로 x, y 구하기
    let result = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
      headers: {
        Authorization: process.env.KAKAO_API_KEY
      },
      params: {
        query: ocr_result.store.addresses
      }
    })

    console.log()
    //2. x,y, keyword()
    let { x, y } = result.data.documents[0].address
    
    result = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
      headers: {
        Authorization: process.env.KAKAO_API_KEY
      },
      params: {
        query: ocr_result.store.name,
        x,
        y,
        radius: 200,
        sort: 'accuracy'
      }
    })

    console.log(result.data)

    if (result.data.documents.length != 0) { // keyword 검색 결과가 존재하지 않으면 넘기기
      result.data.documents.forEach(r => {
        if (r.phone.replace(/\-/g, '') == ocr_result.store.tel) {
          target_store = Object.assign({}, target_store, r)
        }
      })

      if (Object.keys(target_store).length == 0) {
        target_store = result.data.documents[0]
      }

      ocr_result.store.category = target_store?.category_group_name || ''
      ocr_result.store.name = target_store?.place_name || ocr_result.store.name
      ocr_result.store.addresses = target_store?.road_address_name || target_store?.address_name
    }
    
    console.log(ocr_result)

    fs.unlinkSync(__dirname + "/../" + req.file.path)
    return res.status(StatusCodes.OK).json({
      parceData,
      data : ocr_result
    })

    //3. file 삭제
  } catch (error) {
    console.log(error)
    fs.unlinkSync(__dirname + "/../" + req.file.path)
    throw new Error('서버 내부 오류 발생, 다시 시도해주세요.')
  }
}