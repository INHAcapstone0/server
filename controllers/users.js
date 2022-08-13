const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const User = db.User;
const Op = db.Sequelize.Op;
const {isValidPassword, hashPassword}=require('../lib/modules');

exports.getAllUsers = async (req, res) => {
  const { name } = req.query;
  const condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  const users = await User.findAll({})
  
  if (!users.length) {
    throw new NotFoundError('유저가 존재하지 않습니다.')
  }
  // password 필드 제거 후 user에게 리턴
  delete users.password

  res.status(StatusCodes.OK).json(users)
};

exports.getUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id)
  
  if(!user){
    throw new NotFoundError('유저가 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(user)
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  
  if(req.body&&req.body.password){
    if (!isValidPassword(req.body.password)) {
      throw new BadRequestError('패스워드를 숫자, 알파벳, 특수문자를 포함한 8자리로 입력하세요.');
    }
    req.body.password= await hashPassword(req.body.password);
    // promisify 사용 안됨. 나중에 고치기
    // req.body.password = await promisify(hashPassword)(req.body.password);
  }
  
  const result = await User.update(req.body, {
    where: { id: id }
  })
  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`${result}명의 유저가 업데이트되었습니다.` })
  }else{
    throw new NotFoundError('업데이트할 유저가 존재하지 않습니다.')
  }
};

exports.restoreUser = async (req, res) => { // 삭제된 유저 복구
  const { id } = req.params;

  if(!id){
    throw new BadRequestError('유저 id를 입력해주세요.');
  }

  const result = await User.restore({
    where: { id }
  })

  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`유저가 성공적으로 복구되었습니다..` })
  }else{
    throw new NotFoundError('복구할 유저가 존재하지 않습니다.')
  }
}

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if(!id){
    throw new BadRequestError('유저 id를 입력해주세요.');
  }

  const result = await User.destroy({
    where: { id }
  })

  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`유저가 성공적으로 삭제되었습니다.` })
  }else{
    throw new NotFoundError('삭제할 유저가 존재하지 않습니다.')
  }
};




