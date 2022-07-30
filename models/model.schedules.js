'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.User,{
        foreignKey:"owner_id",
        targetKey:"user_id",
      });
      this.hasMany(models.Participant,{
        foreignKey:"schedule_id",
      });
      this.hasMany(models.Receipt,{
        foreignKey:"schedule_id",
      });
    }
  };
  Schedule.init({
    schedule_id: {
      type: DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true,
      comment:"스케줄 식별번호"
    },
    schedule_name:{
      type: DataTypes.STRING,
      comment:"일정 이름"
    },
    owner_id:{
      type:DataTypes.INTEGER,
      comment:"일정 소유자(제작자)"
    },
    completeAt:{
      type:DataTypes.STRING,
      allowNull:true,
      defaultValue:null,
      comment:"정산 마감시각"
    },
    startAt:{
      type:DataTypes.STRING,
      defaultValue:null,
      comment:"일정 시작시간"
    },
    endAt:{
      type:DataTypes.STRING,
      defaultValue:null,
      comment:"일정 종료시간"
    },
  },
  {
    sequelize,
    modelName:"Schedule",
    tableName:"Schedules",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true // timestamps 활성화 시 사용 가능, deleteAt 옵션 on
  });
  
  return Schedule;
};