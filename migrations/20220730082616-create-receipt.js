'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Receipts', {
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
          model: 'Schedules',
          key: 'id'
        },
      },
      poster_id:{
        type:Sequelize.UUID,
        comment:"영수증 게시자 ID",
        references: {
          model: 'Users',
          key: 'id'
        },
      },
      total_price:{
        type:Sequelize.INTEGER,
        defaultValue:0,
        comment:"총 결제금액"
        //constraints 추가 (최대 금액 지정해야 함)
      },
      place_of_payment:{
        type:Sequelize.STRING,
        allowNull:true,
        comment:"구매처(또는 상호명)"
        //constraints 추가 (최대 길이 지정해야 함)
      },
      memo:{
        type:Sequelize.STRING,
        allowNull:true,
        comment:"기타 사항"
        //constraints 추가 (최대 길이 지정해야 함)
      },
      payDate:{
        type:Sequelize.DATE,
        allowNull:true,
        comment:"구매 일자"
        // trigger 등으로 보완해야 할 필드
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
    await queryInterface.dropTable('Receipts');
  }
};