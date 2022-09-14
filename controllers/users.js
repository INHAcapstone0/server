const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors')
const {User, Schedule, Participant} = db;
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

// 특정 스케줄에 속한 유저 제외한 유저목록 반환해주는 api (초대거절,초대보류중 유저도 x)
exports.getUsersNotJoinedInSchedule = async(req, res)=>{ 
  const { exceptScheduleId } = req.query;

  if (!exceptScheduleId){
    throw new BadRequestError('exceptScheduleId를 반드시 입력해주세요.')
  }

  let participant_list=[]
  const results=await Participant.findAll({
    where:{
      schedule_id:exceptScheduleId
    }
  })

  results.forEach(result=>{
    participant_list.push(result.participant_id)
  })

  const users=await User.findAll({
    where:{
      id:{
        [Op.notIn]:participant_list
      }
    }
  })

  if (users.length==0){
    throw new BadRequestError('유저정보가 존재하지 않습니다.')
  }

  res.status(StatusCodes.OK).json(users)
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

exports.deleteUserImage=async(req, res)=>{
  const {id} = req.user;
  const result=await User.update({
    img_url:`https://capstone-storage-server.s3.ap-northeast-2.amazonaws.com/defaultUserImage.png`
  },
  {
   where:{id} 
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
  if(!req.user.admin){
    throw new UnauthenticatedError('해당 유저를 삭제하려면 관리자 권한이 필요합니다.')
  }

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







