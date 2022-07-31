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
        foreignKey:"participant_id",
        target:"id",
      });
      this.belongsTo(models.Schedule,{
        foreignKey:"schedule_id",
        targetKey:"id"
      });
    }
  };
  Participant.init({
    participant_id:{
      type: DataTypes.UUID,
      comment:"참여자 ID"
    },
    schedule_id:{
      type: DataTypes.UUID,
      comment:"참여 일정 ID"
    }
  },
  {
    sequelize,
    modelName:"Participant",
    tableName:"Participants",
    timestamps:true, // createAt, updateAt field 활성화
  });
  
  return Participant;
};