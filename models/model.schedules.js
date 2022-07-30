'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.User,{
        foreignKey:"id",
        as:"owner_id"
      }),
      this.hasMany(models.Participant,{
        foreignKey:"id",
        as:"schedule_id"
      })
    }
  };
  Schedule.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true
    },
    schedule_name:{
      type: DataTypes.STRING
    },
    owner_id:{
      type:DataTypes.INTEGER
    },
    completeAt:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    startFrom:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    endTo:{
      type:DataTypes.STRING,
      defaultValue:null
    },
  },
  {
    sequelize,
    modelName:"Schedule",
    tableName:"Schedules",
    timestamps:true,
    paranoid:true
  });
  
  return Schedule;
};