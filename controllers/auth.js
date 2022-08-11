const User = require('../models').User;
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const jwt=require('../util/jwt-utils')
const redisClient = require('../util/redis');
const bcrypt=require('bcrypt')

const comparePassword = async function (candidatePassword, user) {
  const isMatch=await bcrypt.compare(candidatePassword,user.password)
  return isMatch
}

const login = async (req, res) => {
  const {email, password}=req.body

  if(!email || !password){
    throw new BadRequestError('이메일과 비밀번호를 모두 입력해주세요.')
  }

  const user=await User.findOne({email})

  if(!user){
    throw new NotFoundError('유저가 존재하지 않습니다.')
  }
  const isPasswordCorrect=await comparePassword(password, user)
  if(!isPasswordCorrect){
    throw new UnauthenticatedError('비밀번호가 틀렸습니다.')
  }

  const accessToken = jwt.sign(user);
  const refreshToken = jwt.refresh();

  redisClient.set(user.id, refreshToken);

  res.status(StatusCodes.OK).json({user:user.name, data:{
    accessToken, refreshToken
  }})
}

const register = async (req, res) => {
  let { email, password, name } = req.body;
  var checkPassword = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[$@!%*#?&])[a-z0-9$@!%*#?&]{8,}$");
  if (!checkPassword.test(password)){
    throw new BadRequestError('패스워드를 숫자, 알파벳, 특수문자를 포함한 8자리로 입력하세요.');
  }

  const salt = await bcrypt.genSalt(10);
  password=await bcrypt.hash(password, salt)

  const user = await User.create({ email, password, name })

  res.status(StatusCodes.CREATED).json({user:user.name, email:user.email})
}

module.exports = {
  login, register
}