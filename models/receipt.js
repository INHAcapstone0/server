'use strict';
const { Model } = require('sequelize');
const {BadRequestError}=require('../errors')

module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {
    static associate(models) {
      /*
        Schedule과 N:1
        User와 N:1
        ItemList와 1:N
      */
      this.belongsTo(models.Participant, {
        foreignKey: "poster_id",
        onDelete: 'CASCADE'
      });
      this.belongsTo(models.Schedule, {
        foreignKey: "schedule_id",
        onDelete: 'CASCADE'
      });
      this.hasMany(models.Item, {
        foreignKey: "receipt_id"
      })
    }
  };
  Receipt.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "영수증 식별번호"
    },
    schedule_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "영수증 소속 일정 ID"
    },
    poster_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "영수증 게시자 ID"
    },
    category: {
      type: DataTypes.ENUM('카페', '음식점', '숙박업소', '기타', '편의점', '대형마트','약국'),
      defaultValue:'기타',
      allowNull: false,
      comment: "영수증 카테고리"
    },
    img_url:{
      type:'VARCHAR(3000)',
      comment:"영수증 사진 URL 주소"
    },
    total_price: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false,
      comment: "총 결제금액",
      validate: { // 1000만원 한도
        min: 0,
        max: 10000000
      }
    },
    place: {
      type: DataTypes.STRING,
      comment: "구매처(또는 상호명)"
    },
    address:{
      type: DataTypes.STRING,
      comment: "상세주소"
    },
    tel:{
      type: DataTypes.STRING,
      comment: "가게 전화번호"
    },
    memo: {
      type: DataTypes.STRING,
      comment: "기타 사항"
    },
    payDate: {
      type: DataTypes.DATE,
      comment: "구매 일자"
    }
  },
    {
      sequelize,
      modelName: "Receipt",
      tableName:"receipts",
      timestamps: true, // createAt, updateAt field 활성화
      paranoid: true, // timestamps 활성화 시 사용 가능, deleteAt field 활성화
      hooks: {
        beforeUpdate: async (reciept) => {
          // validate recheck
          if (reciept.total_price<0 || reciept.total_price>10000000){
            throw new BadRequestError('총 금액은 0원~10000000원 사이값으로 지정하세요.')
          }
        }
      }
    });

  return Receipt;
};