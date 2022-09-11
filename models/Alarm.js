'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alarm extends Model {
    /*
      User와 N:1
    */
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: "user_id",
        onDelete: 'CASCADE'
      })
    }
  };
  Alarm.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "알람 식별번호"
    },
    user_id: {
      type: DataTypes.UUID,
      comment: "유저 ID"
    },
    alarm_type: {
      type: DataTypes.ENUM('초대', '정산 확인 요청','정산 확인 완료', '영수증 업로드', '일정 시작', '일정 종료'),
      allowNull:false,
      comment: "알람 타입"
    },
    message: {
      type: DataTypes.STRING,
      comment: "알람 내용 수량"
    },
    checked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "알람 체크 여부",
    }
  },
    {
      sequelize,
      modelName: "Alarm",
      timestamps: true, // createAt, updateAt field 활성화
      paranoid: true, // timestamps 활성화 시 사용 가능, deleteAt field 활성화
    });

  return Alarm;
};