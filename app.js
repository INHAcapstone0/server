require('dotenv').config();
require('express-async-errors');
const PORT=process.env.PORT || 8002
const express = require('express');
const app = express();
const fs = require('fs');
const notFoundMiddleware=require('./middleware/not-found')
const errorHandlerMiddleware=require('./middleware/error-handler')
const cors=require('cors')

// const cors=require('cors'); // 프론트 서버와의 연결 시 사용

// 프론트서버와 연결 시 사용
// var corsOptions={
//     origin:`http://localhost:${CORSPORT}`
// };
// app.use(cors(corsOptions))

//router 추가하기
app.use(express.json())
app.use(cors())

fs
.readdirSync(__dirname + "/routes")
.forEach(data => {
  require(`./routes/${data}`)(app);
})

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start= async()=>{
  try {
    const db = require('./models');
    await db.sequelize.sync() //sequelize sync
    
    app.listen(PORT, ()=>{
      console.log(`Server is running on http://localhost:${PORT}`);
    })
  } catch (error) {
    console.log(error)
  }
}

start();