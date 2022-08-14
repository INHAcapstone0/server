'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    /*
      User와 N:1
      Schedule과 N:1
     */
    static associate(models) {
      this.belongsTo(models.User,{
        foreignKey:"participant_id"
      });
      this.belongsTo(models.Schedule,{
        foreignKey:"schedule_id"
      });
    }
  };
  Participant.init({
    participant_id:{
      type: DataTypes.UUID,
      comment:"참여자 ID",
      primaryKey:true
    },
    schedule_id:{
      type: DataTypes.UUID,
      comment:"참여 일정 ID",
      primaryKey:true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue:'대기 중',
      enum: ['대기 중', '승인', '거절'],
      comment: "참가 요청 상태"
    },
  },
  {
    sequelize,
    modelName:"Participant",
    timestamps:true, // createAt, updateAt field 활성화
  });
  
  return Participant;
};