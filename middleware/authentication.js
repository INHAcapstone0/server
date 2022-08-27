const { verify } = require('../utils/jwt-util');
const { UnauthenticatedError } = require('../errors')

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('인증 헤더 정보가 없거나 올바르지 않습니다.')
  }

  const token = authHeader.split('Bearer ')[1]; // header에서 access token을 가져옵니다.
  const payload = verify(token); // token을 검증합니다.
  if (payload.ok) { // token이 검증되었으면 req에 값을 세팅하고, 다음 콜백함수로 갑니다.
    req.user={id:payload.id, name:payload.name}
    
    if (payload.id=='a9306475-2465-4eac-87a4-4b8d5c6c4d5b'){// 관리자 유저의 Request일 때
      req.user.admin=true
    }
    next();
  } else { // 검증에 실패하거나 토큰이 만료되었다면 클라이언트에게 메세지를 담아서 응답합니다.
    throw new UnauthenticatedError('토큰 정보가 손상되었거나 만료되었습니다.')
  }
};
module.exports = auth