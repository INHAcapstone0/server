
require('dotenv').config();
const {PORT,CORSPORT}=process.env;
const express=require('express');
const app=express();
const cors=require('cors'); // 프론트 서버와의 연결 시 사용
const bodyParser = require('body-parser');
const fs=require('fs');

app.get('/', function(req, res){
    res.end("Index page");
})

// 프론트서버와 연결 시 사용
var corsOptions={
    origin:`http://localhost:${CORSPORT}`
};
app.use(cors(corsOptions))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//sequelize sync
const db=require('./models');
db.sequelize.sync()

//router 추가하기
fs
  .readdirSync(__dirname+"/routes")
  .forEach(data=>{
    require(`./routes/${data}`)(app);
  })

app.listen(PORT, function(){
    console.log(`Server is running on http://localhost:${PORT}`);
})