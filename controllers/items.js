const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors');
const { database } = require('firebase-admin');
const {Item} = db;
const Op = db.Sequelize.Op;

exports.createItem = async (req, res) => {
  const {receipt_id, quantity, price, name}=req.body

  if (!receipt_id || !name) {
    throw new BadRequestError('물픔 id와 name을 필수로 입력해야 합니다.')
  }

  if(quantity){
    if(quantity<0 || quantity>100){
      throw new BadRequestError('수량을 0과 100 사이의 값으로 지정해주세요.')
    }
  }

  if(price){
    if(price<0 || price>2000000){
      throw new BadRequestError('단가를 0과 2000000 사이의 값으로 지정해주세요.')
    }
  }
  
  const item = await Item.create({
    receipt_id, quantity, price, name
  });

  res.status(StatusCodes.CREATED).json(item)
}

exports.createItems=async(req, res)=>{
  const data = req.body

  if(!Array.isArray(data)){
    throw new BadRequestError('물픔 하위 항목을 배열로 보내세요.')
  }

  data.forEach(d=>{
    if (!d.receipt_id || !d.name) {
      throw new BadRequestError('물픔 id와 이름을 필수로 입력해야 합니다.')
    }
  
    if(d.quantity){
      if(d.quantity<0 || d.quantity>100){
        throw new BadRequestError('수량을 0과 100 사이의 값으로 지정해주세요.')
      }
    }
  
    if(d.price){
      if(d.price<0 || d.price>100){
        throw new BadRequestError('단가를 0과 100 사이의 값으로 지정해주세요.')
      }
    }
  })

  const items = Item.bulkCreate(data)
  res.status(StatusCodes.CREATED).json(items)
}

exports.getAllItems = async (req, res) => {
  const { receipt_id, name } = req.query;
  let condition = {}

  if (receipt_id) {
    condition.receipt_id = receipt_id
  }
  if (name) {
    condition.name = {[Op.like]: `%${name}%` }
  }
  
  const items = await Item.findAll({ where: condition })
  if (!items.length) {
    throw new NotFoundError('물품이 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(items)
};

exports.getItem = async (req, res) => {
  const { id } = req.params;

  const item = await Item.findByPk(id)

  if (!item) {
    throw new NotFoundError('물품이 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(item)
};

exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, quantity, price}=req.body

  if (!id) {
    throw new BadRequestError('물품 id를 필수로 입력해야 합니다.')
  }

  if(quantity){
    if(quantity<0 || quantity>100){
      throw new BadRequestError('수량을 0과 100 사이의 값으로 지정해주세요.')
    }
  }

  if(price){
    if(price<0 || price>100){
      throw new BadRequestError('단가를 0과 100 사이의 값으로 지정해주세요.')
    }
  }

  const result = await Item.update({
    name, quantity, price
  }, {
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `물품이 성공적으로 업데이트되었습니다.` })
  } else {
    throw new NotFoundError('업데이트할 물품이 존재하지 않습니다.')
  }
};

exports.restoreItem = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('물품 id를 입력해주세요.');
  }

  const result = await Item.restore({
    where: { id }
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `물품이 성공적으로 복구되었습니다.` })
  } else {
    throw new NotFoundError('복구할 물품이 존재하지 않습니다.')
  }
}

exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('물품 id를 입력해주세요.');
  }

  const result = await Item.destroy({
    where: { id },
    force:true
  })

  if (result == 1) {
    res.status(StatusCodes.OK).json({ msg: `물품이 성공적으로 삭제되었습니다.` })
  } else {
    throw new NotFoundError('삭제할 물품이 존재하지 않습니다.')
  }
};




