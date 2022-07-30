const express=require('express');
const app=express();
const PORT= process.env.PORT || 8001;
const cors=require('cors'); // 프론트 서버와의 연결 시 사용
const bodyParser = require('body-parser');

app.get('/', function(req, res){
    res.end("Index page");
})

// 프론트서버와 연결 시 사용
var corsOptions={
    origin:"http://localhost:8081"
};
app.use(cors(corsOptions))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const db=require('./models');

db.sequelize.sync()

require('./routes/router.user')(app);
require('./routes/router.schedule')(app);
require('./routes/router.participant')(app);

app.listen(PORT, function(){
    console.log(`Server is running on http://localhost:${PORT}`);
})