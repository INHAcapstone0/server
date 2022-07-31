'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /*
      User와 N:1
      Participant와 1:N
      Receipt와 1:N
     */
    static associate(models) {
      this.belongsTo(models.User,{
        foreignKey:"owner_id",
        targetKey:"id",
      });
      this.hasMany(models.Participant,{
        foreignKey:"schedule_id",
        sourceKey:"id"
      });
      this.hasMany(models.Receipt,{
        foreignKey:"schedule_id",
        sourceKey:"id"
      });
      this.hasMany(models.Settlement,{
        foreignKey:"schedule_id",
        sourceKey:"id"
      });
    }
  };
  Schedule.init({
    id: {
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey:true,
      comment:"스케줄 식별번호"
    },
    schedule_name:{
      type: DataTypes.STRING,
      comment:"일정 이름",
      //정규표현식 작성 추가할것
    },
    owner_id:{
      type:DataTypes.UUID,
      comment:"일정 소유자(제작자)"
    },
    completeAt:{
      type:DataTypes.DATE,
      allowNull:true,
      defaultValue:null,
      comment:"정산 마감시각"
      //정규표현식 작성 추가할것
    },
    startAt:{
      type:DataTypes.DATE,
      allowNull:true,
      defaultValue:null,
      comment:"일정 시작시간"
    },
    endAt:{
      type:DataTypes.DATE,
      allowNull:true,
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