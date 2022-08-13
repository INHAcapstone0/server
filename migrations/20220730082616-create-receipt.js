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
      },
      poster_id:{
        type:Sequelize.UUID,
        comment:"영수증 게시자 ID",
        references: {
          model: 'users',
          key: 'id'
        },
      },
      total_price: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
        comment: "총 결제금액",
        validate: { // 1000만원 한도
          min: 0,
          max: 10000000
        }
      },
      place_of_payment: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "구매처(또는 상호명)"
      },
      memo: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "기타 사항"
      },
      payDate: {
        type: Sequelize.DATE,
        allowNull: true,
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