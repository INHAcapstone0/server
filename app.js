require('dotenv').config()
require('express-async-errors')
const PORT = process.env.PORT || 8002
const express = require('express')
const app = express()
const fs = require('fs')
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const scheduler=require('./utils/node-scheduler')
const cors = require('cors')
const helmet = require('helmet')
const ejs = require('ejs')
const morgan = require('morgan')
const logger = require('./winston');
const combined = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"' 

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(helmet()) //보안 관련 HTTP 헤더를 설정
app.use(express.json()) // json parser
app.use(cors({
  origin: '*',
  credentials: true 
})) // 모든 CORS request 허용

app.use(morgan(combined, {stream : logger.stream}));

app.use((req, res, next)=>{ //로깅용 공통 미들웨어 추후에 추가
  const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  console.log(`접속 ip : ${ip}`)
  console.log(`접속 url : http://${req.headers.host}${req.url}`)
  //http://${req.headers.host}
  next();
})


// routes 내의 모든 라우터 미들웨어 등록
fs.readdirSync(__dirname + "/routes")
  .forEach(data => {
    require(`./routes/${data}`)(app)
  })

app.use(notFoundMiddleware); // 라우팅 경로 올바르지 않을 때 예외 처리

app.use(errorHandlerMiddleware) // 모든 에러처리 미들웨어

const start = async () => {
  try {
    const db = require('./models')
    await db.sequelize.sync() //sequelize sync

    app.listen(PORT,'0.0.0.0', () => console.log(`Server is running on http://localhost:${PORT}`))
    scheduler.loadInitialScheduler()
  } catch (err) {
    console.log(err)
  }
}

start()