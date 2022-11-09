'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Settlement extends Model {
    /*
      User와 N:m
      Schedule과 N:1
    */
    static associate(models) {
      this.belongsTo(models.Schedule,{
        foreignKey:"schedule_id",
        targetKey:"id",
        onDelete:'CASCADE'
      });
      this.belongsTo(models.User,{
        foreignKey:"sender_id",
        as: "sender",
        targetKey:"id",
        onDelete:'CASCADE'
      });
      this.belongsTo(models.User,{
        foreignKey:"receiver_id",
        as: "receiver",
        targetKey:"id",
        onDelete:'CASCADE'
      });
    }
  };
  Settlement.init({
    id: {
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey:true,
      comment:"정산 내역 식별번호"
    },
    schedule_id:{
      type: DataTypes.UUID,
      allowNull:false,
      comment:"정산 대상 스케줄 ID",
      references: {
        model: 'schedules',
        key: 'id'
      },
    },
    sender_id:{
      type: DataTypes.UUID,
      allowNull:false,
      comment:"정산액 입금자",
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    receiver_id:{
      type: DataTypes.UUID,
      allowNull:false,
      comment:"정산액 수급자",
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    amount:{
      type: DataTypes.DOUBLE,
      allowNull:false,
      comment:"정산 금액"
    },
    is_paid: {
      type: DataTypes.ENUM('정산 미완료', '확인중', '정산 완료'),
      allowNull:false,
      defaultValue:'정산 미완료',
      comment:"정산 상태"
    },
    due_date:{
      type:DataTypes.DATE,
      comment:"정산 마감일"
    }
  },
  {
    sequelize,
    modelName:"Settlement",
    tableName:"settlements",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true // timestamps 활성화 시 사용 가능, deleteAt field 활성화
  });
  return Settlement;
};