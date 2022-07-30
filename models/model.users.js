'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.Schedule,{
        foreignKey:"id",
        as:"owner_id"
      }),
      this.hasMany(models.Participant,{
        foreignKey:"id",
        as:"participant_id"
      })
    }
  };
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true
    },
    user_id:{
      type: DataTypes.STRING
    },
    user_pw: {
      type: DataTypes.STRING
    },
    user_name:{
      type:DataTypes.STRING
    },
    user_tel:{
      type:DataTypes.STRING,
      defaultValue:null
    },
    login_failed_cnt:{
      type: DataTypes.INTEGER,
      defaultValue:0
    },
    is_locked:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    }

  },
  {
    sequelize,
    tableName:"Users",
    modelName:"User",
    timestamps:true,
    paranoid:true // timestamps 활성화 시 deleteAt 옵션 on
  });

  return User;
};