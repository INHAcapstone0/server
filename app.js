require('dotenv').config()
require('express-async-errors')
const PORT = process.env.PORT || 8002
const express = require('express')
const app = express()
const fs = require('fs')
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
const scheduler=require('./utils/scheduler')

const cors = require('cors')
const helmet = require('helmet')

app.use(helmet()) //보안 관련 HTTP 헤더를 설정
app.use(express.json()) // json parser
app.use(cors()) // 모든 CORS request 허용



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

    app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))
    scheduler.loadInitialSchedule()
  } catch (err) {
    console.log(err)
  }
}

start()