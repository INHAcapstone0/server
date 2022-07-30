const dbConfig=require('../db_config');
const fs=require('fs');
const path = require('path');
const basename = path.basename(__filename);
const Sequelize=require('sequelize');
const db={};

const sequelize=new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,{
    host:dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => { 
    // 모델 작성 시 receipts처럼 단수 표현을 쓰면 이 지점에서 오류 발생, 원인 파악 아직 안됨
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

console.log(db);

db.sequelize=sequelize;
db.Sequelize=Sequelize;

module.exports=db;

