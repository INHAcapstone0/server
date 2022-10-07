const db=require('../models')
const User = db.User;
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const jwt = require('../utils/jwt-util')
const redisClient = require('../utils/redis');
const bcrypt = require('bcrypt')
const {decode} = require('jsonwebtoken');
const nodemailer=require('nodemailer')
const {isValidPassword}=require('../utils/modules');

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
  res.status(StatusCodes.OK).json(result)
}

const logout= async(req, res)=>{
  // 유저 디바이스 토큰 정보 null로 업데이트
  await User.update({ device_token:null }, {
    where: { id: req.user.id }
  })

  res.status(StatusCodes.OK).json({msg:"성공적으로 로그아웃되었습니다."})
}

const register = async (req, res) => {
  let { email, password, name } = req.body;
  if (!isValidPassword(password)) {
    throw new BadRequestError('패스워드를 숫자, 알파벳, 특수문자를 포함한 8자리 이상으로 입력하세요.');
  }

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt)

  let default_image_url=(Math.random()<0.5)?`https://capstone-storage-server.s3.ap-northeast-2.amazonaws.com/defaultUserImage.png`:'https://capstone-storage-server.s3.ap-northeast-2.amazonaws.com/defaultUserImage2.png'
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

const authMail=async(req, res)=>{
  const {email} = req.body

  var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

  if (email.match(regExp) == null) {
    throw new BadRequestError('이메일 형식이 올바르지 않습니다.')
  }

  let authNum = Math.random().toString().substring(2,4)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let mailOptions = {
    from:`N빵<${process.env.NODEMAILER_USER}>`,
    to: email,
    subject: 'N빵 회원가입을 위한 인증번호를 입력해주세요.',
    html:`<html>
    <body>
      <div> 
        <p style='color:black'>회원 가입을 위한 인증번호 입니다.</p>
        <p style='color:black'>아래의 인증 번호를 앱에서 입력하여 인증을 완료해주세요.</p>
        <h2>${authNum}</h2>
      </div>
    </body>
    </html>`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new BadRequestError('인증 이메일 전송에 실패하였습니다. 다시 시도해주세요.')
    }
    console.log(info)
    transporter.close()
  });
  res.status(StatusCodes.CREATED).json({authNum});
}

const issueTempPassword = async(req, res)=>{
  // 1. 사용자 메일 받기
  const {email} = req.body
  // 2. 유저정보에 존재한다면 해당 메일로 임시 비밀번호 생성 후 유저 pw 업데이트 및 임시비밀번호 메일전송
  const user= await User.findOne({where :{email}})

  if (!user){
    throw new NotFoundError('유저 정보를 찾을 수 없습니다.')
  }

  let ranValue1 = ['1','2','3','4','5','6','7','8','9','0']; // 2~5개
	let ranValue2 = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']; //2~4개
	let ranValue3 = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']; //2~4개
	let ranValue4 = ['!','@','#','$','%','^','&','*']; //2~3개
	
	var temp_pw = [];
	
	for(i=0 ; i<Math.floor(Math.random()*4)+2; i++) {
		temp_pw.push(ranValue1[Math.floor(Math.random() * ranValue1.length)]);
  }
  for(i=0 ; i<Math.floor(Math.random()*3)+2; i++) {
		temp_pw.push(ranValue2[Math.floor(Math.random() * ranValue2.length)]);
  }
  for(i=0 ; i<Math.floor(Math.random()*3)+2; i++) {
		temp_pw.push(ranValue3[Math.floor(Math.random() * ranValue3.length)]);
  }
  for(i=0 ; i<Math.floor(Math.random()*2)+2; i++) {
		temp_pw.push(ranValue4[Math.floor(Math.random() * ranValue4.length)]);
  }
  
  temp_pw.sort(() => Math.random() - 0.5); //shuffle
  let new_pw = temp_pw.join('')

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let mailOptions = {
    from:`N빵<${process.env.NODEMAILER_USER}>`,
    to: email,
    subject: 'N빵 임시 비밀번호 재설정',
    html:`<html>
    <body>
      <div> 
        <p style='color:black'>회원님의 이메일로 등록된 계정의 임시 비밀번호를 보내드립니다.</p>
        <p style='color:black'>아래의 임시 비밀번호로 앱에서 로그인한 후 비밀번호를 변경하세요.</p>
        <h2>${new_pw}</h2>
      </div>
    </body>
    </html>`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new BadRequestError('인증 이메일 전송에 실패하였습니다. 다시 시도해주세요.')
    }
    transporter.close()
  });

  new_pw= await hashPassword(new_pw);

  await User.update({ password: new_pw },
    { where: { id: user.id } }
  )

  res.status(StatusCodes.OK).json({msg : "입력하신 이메일로 임시 비밀번호를 전송하였습니다."});
}

module.exports = {
  login, register, checkName, checkEmail, refresh, authMail, logout, issueTempPassword
}