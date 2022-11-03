const { StatusCodes } = require("http-status-codes")
const axios = require('axios')

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

exports.test = async(req, res)=>{
  console.log('awefawefwae')
  res.send('okokokokookkko')
}