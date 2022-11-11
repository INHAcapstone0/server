const { StatusCodes } = require("http-status-codes")
const axios = require('axios')
const {OPENBANK_CLIENT_ID,OPENBANK_CALLBACK_URL_1,OPENBANK_CLIENT_USE_CODE,OPENBANK_STATE_RANDSTR,OPENBANK_CLIENT_SECRET} = process.env
const { BadRequestError, NotFoundError, UnauthenticatedError, ServiceUnavaliableError } = require('../errors')
const request = require('request')
const db = require('../models');
const {User} = db;
const {nowYYYYMMDDhhmmss, generateRandom9Code}=require('../utils/modules');
const redisClient=require('../utils/redis');

exports.kakoAPI  =async(req, res)=>{
  let {query} = req.query

  result = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
    headers: {
      Authorization: process.env.KAKAO_API_KEY
    },
    params: {
      query,
      sort: 'accuracy'
    }
  })
  res.status(StatusCodes.OK).json(result.data)
}

// exports.firstAuthorize = async (req, res) => { // 사용자 최초 인증 시

  // let redirect_uri = `https://testapi.openbanking.or.kr/oauth/2.0/authorize?`+
  // `response_type=code&client_id=${OPENBANK_CLIENT_ID}&`+
  // `scope=login inquiry transfer&auth_type=0&redirect_uri=${OPENBANK_CALLBACK_URL_1}&`+
  // `state=${OPENBANK_STATE_RANDSTR}`
  // `&client_info=${req.user.id}`

//   console.log(`Redirect to ${redirect_uri}`)
//   res.redirect(redirect_uri)
// }

exports.receiveCodeAndSend = async(req, res)=>{ // Callback URI
  let {state, code,client_info} = req.query
  
  console.log(client_info+'님의 요청')
  if(state!=OPENBANK_STATE_RANDSTR){
    throw new UnauthenticatedError('CSRF 보안 위협이 감지되었습니다. 다시 시도해주세요.')
  }

  if(!client_info){
    throw new UnauthenticatedError('유저정보가 존재하지 않습니다. 다시 시도해주세요.')
  }
  let user = await User.findByPk(client_info)

  if(!user){
    throw new BadRequestError('유저정보가 존재하지 않습니다. 다시 시도해주세요.')
  }

  let option = {
    method : "POST",
    url : "https://testapi.openbanking.or.kr/oauth/2.0/token",
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      code,
      client_id: OPENBANK_CLIENT_ID,
      client_secret: OPENBANK_CLIENT_SECRET,
      redirect_uri: OPENBANK_CALLBACK_URL_1,
      grant_type: 'authorization_code'
    }
  }
  // resultChild 호출해서 얻은 토큰 정보를 사이트에 입력
  request(option, async (err, response, body)=>{
    console.log(body);
    var requestResultJSON = JSON.parse(body);

    if(!requestResultJSON.access_token){ // 토큰값을 정상적으로 가져오지 못할 때
      //실패 페이지 보여주기
      console.log('failed')
    }

    await redisClient.set(requestResultJSON.user_seq_no, JSON.stringify({
      access_token:requestResultJSON.access_token,
      refresh_token:requestResultJSON.refresh_token,
    }))

    await redisClient.expire(requestResultJSON.user_seq_no, 60*60) // 1시간뒤에 만료시키기
    
    await User.update({
      user_seq_no:requestResultJSON.user_seq_no
    },{
      where:{
        id:client_info
      }
    })
    
    res.render('index',{})
    // 나중에 돌아가기 버튼 추가해서 바꿀 것
  }); 
}

exports.refreshToken = async (req, res) => { // 토큰 refresh, 시간 좀 걸림
  let refresh_token=req.headers.refresh
  let token = req.header('bank-authorization')

  if(!refresh_token || ! token ){
    throw new UnauthenticatedError('갱신 토큰 또는 액세스 토큰이 존재하지 않습니다.')
  }

  let option = {
    method : "POST",
    url : "https://testapi.openbanking.or.kr/oauth/2.0/token",
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': token
    },
    form: {
      refresh_token,
      client_id: OPENBANK_CLIENT_ID,
      client_secret: OPENBANK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      scope:'login inquiry transfer'
    }
  }
  console.log(option)
  // resultChild 호출해서 얻은 토큰 정보를 사이트에 입력
  request(option, async (err, response, body)=>{
    var requestResultJSON = JSON.parse(body);
    console.log(requestResultJSON)

    if(requestResultJSON.rsp_code!="A0000"){
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ msg: requestResultJSON.rsp_message })
    }else{
      return res.json({ data: requestResultJSON })
    }
  })
}


exports.getToken=async(req, res)=>{
  let {id}=req.user

  let user = await User.findByPk(id)

  if(!user.user_seq_no){
    throw new BadRequestError('유저고유등록번호(user_seq_no)가 존재하지 않습니다. 다시 인증을 해주세요.')
  }

  let user_tokens = await redisClient.get(user.user_seq_no)
  
  if (!user_tokens){
    throw new NotFoundError('오픈뱅킹 액세스 토큰이 존재하지 않거나 만료되었습니다.')
  }

  res.status(StatusCodes.OK).json(JSON.parse(user_tokens))
}

exports.myInfo=async(req, res)=>{
  let token = req.header('bank-authorization')
  let user = await User.findByPk(req.user.id)

  if(!user.user_seq_no){
    throw new NotFoundError('유저고유식별번호가 존재하지 않습니다.')
  }

  const result = await axios
    .get(`https://testapi.openbanking.or.kr/v2.0/user/me?user_seq_no=${user.user_seq_no}`
      , {
        headers: {
          'Authorization': token
        },
      })
  
  console.log(result.data)
  if(result.data.rsp_code!='A0000'){ // 액세스토큰 만료 시
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ msg: result.data.rsp_message })
  }

  res.status(StatusCodes.OK).json(result.data)
}

exports.myAccount = async (req, res) => {
  let token = req.header('bank-authorization')
  let user = await User.findByPk(req.user.id)

  if(!user.user_seq_no){
    throw new NotFoundError('유저고유식별번호가 존재하지 않습니다.')
  }

  const result = await axios
    .get(`https://testapi.openbanking.or.kr/v2.0/account/list?user_seq_no=${user.user_seq_no}`
      , {
        headers: {
          'Authorization': token
        },
      })
  res.status(StatusCodes.OK).json(result.data)
}

exports.myTranList = async(req, res)=>{
  //from_date, to_date : yyyymmdd
  let {fintech_use_num, from_date,to_date}=req.query
  let token = req.header('bank-authorization')

  console.log(`bank_tran_id=${OPENBANK_CLIENT_USE_CODE}U${generateRandom9Code()}`)
  const result = await axios
    .get(`https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num?`+
    `bank_tran_id=${OPENBANK_CLIENT_USE_CODE}U${generateRandom9Code()}&`+
    `fintech_use_num=${fintech_use_num}&`+
    `inquiry_type=O&`+
    `inquiry_base=D&`+
    `from_date=${from_date}&`+
    `to_date=${to_date}&`+
    `sort_order=D&`+
    `tran_dtime=${nowYYYYMMDDhhmmss()}`
    ,{
      headers: {
        'Authorization': token
      },
    })
    if(result.data.rsp_code!='A0000'){ // 액세스토큰 만료 시
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ msg: result.data.rsp_message })
    }

  res.status(StatusCodes.OK).json(result.data)
}

exports.deleteAccount = async(req, res)=>{
  let {fintech_use_num}=req.body
  let token = req.header('bank-authorization')

  if(!fintech_use_num || !token){
    throw new BadRequestError('잘못된 요청입니다. 핀테크넘버와 토큰을 모두 전송해야합니다.')
  }

  let bank_tran_id=`${OPENBANK_CLIENT_USE_CODE}U${generateRandom9Code()}`

  const result = await axios
  .post(`https://testapi.openbanking.or.kr/v2.0/account/cancel`,{
    bank_tran_id,
    scope:'login inquiry transfer',
    fintech_use_num
  },{
    headers:{
      'Authorization': token
    }
  })
  if(result.data.rsp_code){ // 액세스토큰 만료 시
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({ msg: result.data.rsp_message })
  }
  res.status(StatusCodes.OK).json(result.data)
}


exports.test1 = async(req, res)=>{
  console.log('waefafe')
  res.render('index',{})
}

exports.test2 = async(req, res)=>{
  res.redirect(`http://${req.headers.host}/extra/test1`)
}