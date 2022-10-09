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
        onDelete: 'CASCADE'
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
      allowNull:false,
      comment:"영수증 ID"
    },
    name:{
      type:DataTypes.STRING,
      allowNull:false,
      default:'무제',
      comment:"물픔(또는 구매내역) 이름"
    },
    quantity:{
      type:DataTypes.INTEGER,
      allowNull:false,
      defaultValue:1,
      comment:"물품 수량",
      validate:{ // 최대 100개 한도
        min:0,
        max:100
      }
    },
    price:{
      type:DataTypes.INTEGER,
      allowNull:false,
      defaultValue:0,
      comment:"물품 단가",
      validate:{ // 최대 200만원 한도
        min:0,
        max:2000000
      }
    }
  },
  {
    sequelize,
    modelName:"Item",
    tableName:"items",
    timestamps:true, // createAt, updateAt field 활성화
    paranoid:true, // timestamps 활성화 시 사용 가능, deleteAt field 활성화
    hooks:{
      beforeCreate:async(item)=>{
        // validation check
      },
      beforeUpdate:async(item)=>{
        // validation check
      },
    }
  });
  
  return Item;
};