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
        foreignKey: "owner_id",
        allowNull: false,
        constraints: true,
        onDelete: 'CASCADE'
      });
      this.hasMany(models.Participant,{
        foreignKey:"schedule_id",
        onDelete: 'CASCADE'
      });
      this.hasMany(models.Receipt,{
        foreignKey:"schedule_id",
        onDelete: 'CASCADE'
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
    name:{
      type: DataTypes.STRING,
      comment:"일정 이름"
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
      comment:"일정 종료시간(또는 정산 시작시간)"
    },
  },
  {
    sequelize,
    modelName:"Schedule",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true, // timestamps 활성화 시 사용 가능, deleteAt 옵션 on
  })
  return Schedule;
};