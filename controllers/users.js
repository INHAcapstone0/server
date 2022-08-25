const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const User = db.User;
const Op = db.Sequelize.Op;
const {isValidPassword, hashPassword}=require('../lib/modules');

exports.getAllUsers = async (req, res) => {
  // exceptMe는 자신을 제외하는 flag값 ('true'값만 인식함)
  const { name, exceptMe } = req.query;
  let condition={}

  if(name){
    condition.name = { [Op.like]: `%${name}%` } 
  }
  
  if(exceptMe&&exceptMe=='true'){
    condition.id={[Op.ne]:req.user.id}
  }

  const users = await User.findAll({
    where:condition,
    attributes:{ // 패스워드 정보는 제거 후 리턴
      exclude:['password']
    }
  })
  
  if (!users.length) {
    throw new NotFoundError('유저가 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(users)
}

exports.getUser = async (req, res) => {
  const { id } = req.params;

  if(!id){
    throw new BadRequestError('id를 입력해주세요.')
  }

  const user = await User.findByPk(id)
  
  if(!user){
    throw new NotFoundError('유저가 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(user)
}

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  let {password, name}=req.body;
  if(!id){
    throw new BadRequestError('id를 입력해주세요.')
  }

  if(password){
    if (!isValidPassword(password)) {
      throw new BadRequestError('패스워드를 숫자, 알파벳, 특수문자를 포함한 8자리로 입력하세요.');
    }
    password= await hashPassword(password);
    // promisify 사용 안됨. 나중에 고치기
  }
  
  const result = await User.update({password, name}, {
    where: {id}
  })
  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`유저가 성공적으로 업데이트되었습니다.` })
  }else{
    throw new NotFoundError('업데이트할 유저가 존재하지 않습니다.')
  }
}

exports.uploadUserImage=async(req, res)=>{
  const {id} = req.user;
  
  console.log(req.file.location) // 업로드한 파일 위치

  const img_url=req.file.location

  if(!img_url){
    throw new BadRequestError('파일 저장 중 오류가 발생했습니다.')
  }

  const result = await User.update({img_url}, {
    where: {id}
  })

  if(result==1){
    res.status(StatusCodes.OK).json({ msg:`유저 프로필이 성공적으로 업데이트되었습니다.` })
  }else{
    throw new NotFoundError('업데이트할 유저가 존재하지 않습니다.')
  }
}

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
}







