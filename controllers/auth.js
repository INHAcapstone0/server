const db=require('../models')
const User = db.User;
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const jwt = require('../utils/jwt-util')
const redisClient = require('../utils/redis');
const bcrypt = require('bcrypt')
const {decode} = require('jsonwebtoken');
const {verifyFCMToken}=require('../firebase')

const comparePassword = async function (candidatePassword, user) {
  const isMatch = await bcrypt.compare(candidatePassword, user.password)
  return isMatch
}

const login = async (req, res) => {
  const { email, password, device_token } = req.body

  if (!email || !password) {
    throw new BadRequestError('이메일과 비밀번호를 모두 입력해주세요.')
  }

  const user = await User.findOne({ where:{email} })

  if (!user) {
    throw new NotFoundError('유저가 존재하지 않습니다.')
  }
  const isPasswordCorrect = await comparePassword(password, user)
  if (!isPasswordCorrect) {
    throw new NotFoundError('비밀번호가 틀렸습니다.')
  }

  const accessToken = jwt.sign(user);
  const refreshToken = jwt.refresh();

  redisClient.set(user.id, refreshToken);

  let result={
    user: user.name,
    user_id: user.id,
    data: {
      accessToken, refreshToken
    }
  }

  // 유저 device token 가져와서 null이면 그대로 채워주고, 이미 값이 존재하고 일치하지 않으면
  // msg에 새로운 디바디스에서 접속하였습니다 메세지 출력

  if (device_token){ //parameter가 있으면
    //device token 유효성 검증
    const validateToken=await verifyFCMToken(device_token)
  
    if (validateToken && (device_token!=user.device_token)){ // 일치하지 않을 때만 메세지 추가 후 update
    
      await User.update({device_token}, {
        where: {id:user.id}
      })
      result.msg='새로운 디바이스에서 접속하였습니다.'
    }
  }


  res.status(StatusCodes.OK).json(result)
}

const register = async (req, res) => {
  let { email, password, name } = req.body;
  var checkPassword = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[$@^!%*#?&])[a-z0-9$@^!%*#?&]{8,}$");
  if (!checkPassword.test(password)) {
    throw new BadRequestError('패스워드를 숫자, 알파벳, 특수문자를 포함한 8자리 이상으로 입력하세요.');
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt)

  let default_image_url=`https://capstone-storage-server.s3.ap-northeast-2.amazonaws.com/defaultUserImage.png`
  const user = await User.create({ email, password, name, img_url:default_image_url })

  res.status(StatusCodes.CREATED).json({ user: user.name, email: user.email })
}

const checkEmail = async (req, res) => {
  let { email } = req.query;
  email = email.trim()

  if (!email) {
    throw new BadRequestError('중복 확인할 이메일을 입력하세요.');
  }
  
  const result = await User.findOne({
    where: {email}
  });
  
  if (result) { // result가 존재할 때 duplicated:true
    res.status(StatusCodes.OK).json({ duplicated: true })
  } else {
    res.status(StatusCodes.OK).json({ duplicated: false })
  }
}

const checkName = async (req, res) => {
  let { name } = req.query;
  name = name.trim()

  if (!name) {
    throw new BadRequestError('중복 확인할 이름을 입력하세요.');
  }
  
  const result = await User.findOne({
    where: {name}
  });
  
  if (result) { // result가 존재할 때 duplicated:true
    res.status(StatusCodes.OK).json({ duplicated: true })
  } else {
    res.status(StatusCodes.OK).json({ duplicated: false })
  }
}

const refresh = async (req, res) => {
  // access token과 refresh token의 존재 유무를 체크합니다.
  if (req.headers.authorization && req.headers.refresh) {
    const authToken = req.headers.authorization.split('Bearer ')[1];
    const refreshToken = req.headers.refresh;

    // access token 검증 -> expired여야 함.
    const authResult = jwt.verify(authToken);

    // access token 디코딩하여 user의 정보를 가져옵니다.
    const decoded = decode(authToken);
	
    // 디코딩 결과가 없으면 권한이 없음을 응답.
    if (decoded === null) {
      throw new UnauthenticatedError('권한이 없습니다. 재로그인해주세요.')
    }
	
    /* access token의 decoding 된 값에서 유저의 id를 가져와 refresh token을 검증합니다. */
    const refreshResult = jwt.refreshVerify(refreshToken, decoded.id);

    // 재발급을 위해서는 access token이 만료되어 있어야합니다.
    if (authResult.ok === false && authResult.message === 'jwt expired') {
      // 1. access token이 만료되고, refresh token도 만료 된 경우 => 새로 로그인해야합니다.
      if (refreshResult.ok === false) {
        throw new UnauthenticatedError('권한이 없습니다. 재로그인해주세요.')
      } else {
        // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
        
        const user=await User.findByPk(decoded.id)
        if(!user){
          throw new UnauthenticatedError('권한이 없습니다. 재로그인해주세요.')
        }

        const newAccessToken = jwt.sign(user);

        res.status(StatusCodes.OK).json({ // 새로 발급한 access token과 원래 있던 refresh token 모두 클라이언트에게 반환합니다.
          data: {
            accessToken: newAccessToken,
            refreshToken,
          },
        });
      }
    } else {
      // 3. access token이 만료되지 않은경우 => refresh 할 필요가 없습니다.
      throw new BadRequestError('Access token이 만료되지 않았습니다.')
    }
  } else { // access token 또는 refresh token이 헤더에 없는 경우
    throw new BadRequestError('Access token 또는 refresh token이 헤더에 존재하지 않습니다.');
  }
};

module.exports = {
  login, register, checkName, checkEmail, refresh
}