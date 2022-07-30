'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ItemList extends Model {
    static associate(models) {
      this.belongsTo(models.Receipt,{
        foreignKey:"receipt_id",
        as:"item_receipt_id"
      })
    }
  };
  ItemList.init({
    item_id:{
      type:DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true,
      comment:"물품(또는 구매) 식별번호"
    },
    receipt_id:{
      type: DataTypes.INTEGER,
      comment:"영수증 ID"
    },
    item_name:{
      type:DataTypes.STRING,
      comment:"물픔(또는 구매내역) 이름"
    },
    item_quantity:{
      type:DataTypes.INTEGER,
      defaultValue:1,
      comment:"물품 수량"
    },
    item_price:{
      type:DataTypes.INTEGER,
      allowNull:true,
      defaultValue:0,
      comment:"물품 단가"
    }
  },
  {
    sequelize,
    modelName:"ItemList",
    tableName:"ItemLists",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true // timestamps 활성화 시 사용 가능, deleteAt field 활성화
  });
  
  return ItemList;
};