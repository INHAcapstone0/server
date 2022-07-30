'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Settlement extends Model {
    static associate(models) {
      this.belongsTo(models.Schedule,{
        foreignKey:"schedule_id"
      });
      this.belongsTo(models.User,{
        foreignKey:"sender_id",
        targetKey:"user_id"
      });
      this.belongsTo(models.User,{
        foreignKey:"receiver_id",
        targetKey:"user_id"
      });
    }
  };
  Settlement.init({
    settlement_id: {
      type: DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true,
      comment:"정산 내역 식별번호"
    },
    schedule_id:{
      type: DataTypes.INTEGER,
      comment:"정산 대상 스케줄 ID"
    },
    sender_id:{
      type: DataTypes.INTEGER,
      comment:"정산액 입금자"
    },
    receiver_id:{
      type: DataTypes.INTEGER,
      comment:"정산액 수급자"
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue:false,
      comment:"정산 여부"
    },
    due_date:{
      type:DataTypes.STRING,
      comment:"정산 마감일"
    }
  },
  {
    sequelize,
    tableName:"Settlements",
    modelName:"Settlement",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true // timestamps 활성화 시 사용 가능, deleteAt field 활성화
  });
  return Settlement;
};