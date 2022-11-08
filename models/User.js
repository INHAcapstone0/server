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
      });
      this.hasMany(models.Participant,{
        foreignKey:"participant_id",
      });
      this.hasMany(models.Alarm,{
        foreignKey:"user_id",
      });
      this.hasMany(models.Settlement,{
        foreignKey:"sender_id",
        sourceKey:"id",
        onDelete: 'CASCADE'
      })
      this.hasMany(models.Settlement,{
        foreignKey:"receiver_id",
        sourceKey:"id",
        onDelete: 'CASCADE'
      })
    }
  };
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey:true,
      comment:"유저 식별번호"
    },
    email:{
      type: DataTypes.STRING,
      unique:true,
      allowNull:false,
      validate:{
        isEmail:true,
      },
      comment:"이메일"
    },
    password: {
      type: DataTypes.STRING,
      allowNull:false,
      comment:"비밀번호(해싱된 32자리 string), bcrypt로 해싱"
    },
    temp_password: {
      type: DataTypes.STRING,
      comment:"임시 비밀번호(해싱된 32자리 string), bcrypt로 해싱",
    },
    name:{
      type:DataTypes.STRING,
      unique:true,
      allowNull:false,
      comment:"유저 이름, 특수문자 제외 2자 이상 10자 이하"
      //정규표현식 작성 추가할것
    },
    img_url:{
      type:'VARCHAR(3000)',
      comment:"유저 프로필 사진 URL 주소"
      //정규표현식 작성 추가할것
    },
    login_failed_cnt:{
      type: DataTypes.INTEGER,
      defaultValue:0,
      allowNull: false,
      comment:"로그인 실패 횟수",
      validate:{
        max:5
      }
    },
    is_locked:{
      type:DataTypes.BOOLEAN,
      defaultValue:false,
      allowNull: false,
      comment:"계정 잠김 여부(로그인 5회 실패)"
    },
    device_token:{
      type:'VARCHAR(1000)',
      comment:"유저 디바이스 토큰"
    },
    user_seq_no:{
      type: DataTypes.STRING,
      comment:"유저고유식별번호"
    },
  },
  {
    sequelize,
    modelName:"User",
    tableName:"users",
    timestamps:true, // createdAt, updatedAt 활성화
    paranoid:true, // timestamps 활성화 시 사용 가능, deletedAt field 활성화
  });
  return User;
};