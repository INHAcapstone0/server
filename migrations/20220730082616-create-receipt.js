'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('receipts', {
      id:{
        type:Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        comment:"영수증 식별번호"
      },
      schedule_id:{
        type: Sequelize.UUID,
        comment:"영수증 소속 일정 ID",
        references: {
          model: 'schedules',
          key: 'id'
        },
        allowNull: false,
        onDelete: 'CASCADE'
      },
      poster_id:{
        type:Sequelize.UUID,
        allowNull: false,
        comment:"영수증 게시자 ID",
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE'
      },
      category: {
        type: Sequelize.ENUM('카페', '음식점', '숙박업소', '기타'),
        defaultValue:'기타',
        allowNull: false,
        comment: "영수증 카테고리"
      },
      img_url:{
        type:'VARCHAR(3000)',
        comment:"영수증 사진 URL 주소"
      },
      total_price: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
        allowNull: false,
        comment: "총 결제금액",
        validate: { // 1000만원 한도
          min: 0,
          max: 10000000
        }
      },
      place: {
        type: Sequelize.STRING,
        comment: "구매처(또는 상호명)"
      },
      address:{
        type: Sequelize.STRING,
        comment: "상세주소"
      },
      tel:{
        type: Sequelize.STRING,
        comment: "가게 전화번호"
      },
      memo: {
        type: Sequelize.STRING,
        comment: "기타 사항"
      },
      payDate: {
        type: Sequelize.DATE,
        comment: "구매 일자"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('receipts');
  }
};