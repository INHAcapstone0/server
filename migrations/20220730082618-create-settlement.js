'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Settlements', {
      id: {
        type: Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        comment:"정산 내역 식별번호"
      },
      schedule_id:{
        type: Sequelize.UUID,
        comment:"정산 대상 스케줄 ID",
        references: {
          model: 'Schedules',
          key: 'id'
        },
      },
      sender_id:{
        type: Sequelize.UUID,
        comment:"정산액 입금자",
        references: {
          model: 'Users',
          key: 'id'
        },
      },
      receiver_id:{
        type: Sequelize.UUID,
        comment:"정산액 수급자",
        references: {
          model: 'Users',
          key: 'id'
        },
      },
      is_paid: {
        type: Sequelize.BOOLEAN,
        defaultValue:false,
        comment:"정산 여부"
      },
      due_date:{
        type:Sequelize.DATE,
        allowNull:true,
        comment:"정산 마감일"
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
    await queryInterface.dropTable('Settlements');
  }
};