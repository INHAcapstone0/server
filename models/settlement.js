'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Settlement extends Model {
    /*
      User와 N:m
      Schedule과 N:1
    */
    static associate(models) {
      this.belongsTo(models.Participant,{
        foreignKey:"schedule_id",
        targetKey:"schedule_id",
        onDelete:'CASCADE'
      });
      this.belongsTo(models.Participant,{
        foreignKey:"sender_id",
        targetKey:"participant_id",
        onDelete:'CASCADE'
      });
      this.belongsTo(models.Participant,{
        foreignKey:"receiver_id",
        targetKey:"participant_id",
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
      comment:"정산 대상 스케줄 ID",
      references: {
        model: 'participants',
        key: 'schedule_id'
      },
    },
    sender_id:{
      type: DataTypes.UUID,
      comment:"정산액 입금자",
      references: {
        model: 'participants',
        key: 'participant_id'
      },
    },
    receiver_id:{
      type: DataTypes.UUID,
      comment:"정산액 수급자",
      references: {
        model: 'participants',
        key: 'participant_id'
      },
    },
    amount:{
      type: DataTypes.DOUBLE,
      comment:"정산 금액"
    },
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue:false,
      comment:"정산 여부"
    },
    due_date:{
      type:DataTypes.DATE,
      allowNull:true,
      comment:"정산 마감일"
    }
  },
  {
    sequelize,
    modelName:"Settlement",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true // timestamps 활성화 시 사용 가능, deleteAt field 활성화
  });
  return Settlement;
};