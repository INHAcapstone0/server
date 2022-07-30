'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {
    static associate(models) {
      /*
        Schedule과 N:1
        User와 N:1
        ItemList와 1:N
      */
      this.belongsTo(models.User,{
        foreignKey:"poster_id",
        targetKey:"user_id"
      });
      this.belongsTo(models.Schedule,{
        foreignKey:"schedule_id"
      });
      this.hasMany(models.ItemList,{
        foreignKey:"receipt_id",
      })
    }
  };
  Receipt.init({
    receipt_id:{
      type:DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey:true,
      comment:"영수증 식별번호"
    },
    schedule_id:{
      type: DataTypes.UUID,
      comment:"영수증 소속 일정 ID"
    },
    poster_id:{
      type:DataTypes.UUID,
      comment:"영수증 게시자 ID"
    },
    total_price:{
      type:DataTypes.INTEGER,
      defaultValue:0,
      comment:"총 결제금액"
      //constraints 추가 (최대 금액 지정해야 함)
    },
    place_of_payment:{
      type:DataTypes.STRING,
      allowNull:true,
      comment:"구매처(또는 상호명)"
      //constraints 추가 (최대 길이 지정해야 함)
    },
    memo:{
      type:DataTypes.STRING,
      allowNull:true,
      comment:"기타 사항"
      //constraints 추가 (최대 길이 지정해야 함)
    },
    payDate:{
      type:DataTypes.STRING,
      allowNull:true,
      comment:"구매 일자"
      // trigger 등으로 보완해야 할 필드
    }
  },
  {
    sequelize,
    modelName:"Receipt",
    tableName:"Receipts",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true // timestamps 활성화 시 사용 가능, deleteAt field 활성화
  });
  
  return Receipt;
};