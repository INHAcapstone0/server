'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.User,{
        foreignKey:"id",
        as:"participant_id"
      }),
      this.belongsTo(models.Schedule,{
        foreignKey:"id",
        as:"schedule_id"
      })
    }
  };
  Participant.init({
    participant_id:{
      type: DataTypes.INTEGER
    },
    schedule_id:{
      type: DataTypes.INTEGER
    }

  },
  {
    sequelize,
    modelName:"Participant",
    tableName:"Participants",
    timestamps:true,
  });
  
  return Participant;
};