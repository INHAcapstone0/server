'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /*
      Recipt와 N:1
    */
    static associate(models) {
      this.belongsTo(models.Receipt,{
        foreignKey:"receipt_id",
        targetKey:"id"
      })
    }
  };
  Item.init({
    id:{
      type:DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey:true,
      comment:"물품(또는 구매) 식별번호"
    },
    receipt_id:{
      type: DataTypes.UUID,
      comment:"영수증 ID"
    },
    item_name:{
      type:DataTypes.STRING,
      comment:"물픔(또는 구매내역) 이름"
      //정규 표현식 추가
    },
    item_quantity:{
      type:DataTypes.INTEGER,
      defaultValue:1,
      comment:"물품 수량"
      //constraints 추가
    },
    item_price:{
      type:DataTypes.INTEGER,
      defaultValue:0,
      comment:"물품 단가"
      //constraints 추가
    }
  },
  {
    sequelize,
    modelName:"Item",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true // timestamps 활성화 시 사용 가능, deleteAt field 활성화
  });
  
  return Item;
};