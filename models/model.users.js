'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /*
      Schedule과 1:N
      Participant와 1:N
      Settlement와 1:N
      Receipt와 1:N
     */
    static associate(models) {
      this.hasMany(models.Schedule,{
        foreignKey:"owner_id",
        sourceKey:"user_id",
      });
      this.hasMany(models.Participant,{
        foreignKey:"participant_id",
        sourceKey:"user_id"
      });
      this.hasMany(models.Receipt,{
        foreignKey:"poster_id",
        sourceKey:"user_id"
      });
      this.hasMany(models.Settlement,{
        foreignKey:"sender_id",
        sourceKey:"user_id"
      });
      this.hasMany(models.Settlement,{
        foreignKey:"receiver_id",
        sourceKey:"user_id"
      });
    }
  };
  User.init({
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true,
      comment:"유저 식별번호"
    },
    user_email:{
      type: DataTypes.CHAR(20),
      unique:true,
      comment:"이메일"
    },
    user_pw: {
      type: DataTypes.STRING,
      comment:"비밀번호(해싱된 32자리 string)"
    },
    user_name:{
      type:DataTypes.STRING,
      unique:true,
      comment:"유저 이름"
    },
    login_failed_cnt:{
      type: DataTypes.INTEGER,
      defaultValue:0,
      comment:"로그인 실패 횟수"
    },
    is_locked:{
      type:DataTypes.BOOLEAN,
      defaultValue:false,
      comment:"계정 잠김 여부(로그인 5회 실패)"
    }
  },
  {
    sequelize,
    tableName:"Users",
    modelName:"User",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true // timestamps 활성화 시 사용 가능, deleteAt field 활성화
  });
  return User;
};