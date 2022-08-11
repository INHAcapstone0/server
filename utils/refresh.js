const db=require('../models')
const User=db.User;
const { sign, verify, refreshVerify } = require('./jwt-util');
const jwt = require('jsonwebtoken');
const {UnauthenticatedError, BadRequestError}=require('../errors')
const {StatusCodes}=require('http-status-codes')
const refresh = async (req, res) => {
  // access token과 refresh token의 존재 유무를 체크합니다.
  if (req.headers.authorization && req.headers.refresh) {
    const authToken = req.headers.authorization.split('Bearer ')[1];
    const refreshToken = req.headers.refresh;

    // access token 검증 -> expired여야 함.
    const authResult = verify(authToken);

    // access token 디코딩하여 user의 정보를 가져옵니다.
    const decoded = jwt.decode(authToken);
	
    // 디코딩 결과가 없으면 권한이 없음을 응답.
    if (decoded === null) {
      throw new UnauthenticatedError('권한이 없습니다. 재로그인해주세요.')
    }
	
    /* access token의 decoding 된 값에서 유저의 id를 가져와 refresh token을 검증합니다. */
    const refreshResult = refreshVerify(refreshToken, decoded.id);

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

        const newAccessToken = sign(user);

        res.status(StatusCodes.OK).send({ // 새로 발급한 access token과 원래 있던 refresh token 모두 클라이언트에게 반환합니다.
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

module.exports = refresh;