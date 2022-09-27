const db=require('../models')
const User = db.User;
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const jwt = require('../utils/jwt-util')
const redisClient = require('../utils/redis');
const bcrypt = require('bcrypt')
const {decode} = require('jsonwebtoken');
const nodemailer=require('nodemailer')

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

const authMail=async(req, res)=>{
  const {toEmail} = req.body

  var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

  if (toEmail.match(regExp) == null) {
    throw new BadRequestError('이메일 형식이 올바르지 않습니다.')
  }

  let authNum = Math.random().toString().substring(2,4)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  let mailOptions = await transporter.sendMail({
    from:`N빵<${process.env.NODEMAILER_USER}>`,
    to: toEmail,
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
  });

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw new BadRequestError('인증 이메일 전송에 실패하였습니다. 다시 시도해주세요.')
    }
    console.log(info)
    transporter.close()
  });
  res.status(StatusCodes.CREATED).json({authNum});
}

module.exports = {
  login, register, checkName, checkEmail, refresh, authMail, logout
}