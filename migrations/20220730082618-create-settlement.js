'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('settlements', {
      id: {
        type: Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        comment:"정산 내역 식별번호"
      },
      schedule_id:{
        type: Sequelize.UUID,
        allowNull:false,
        comment:"정산 대상 스케줄 ID",
        onDelete:'CASCADE',
        references: {
          model: 'participants',
          key: 'schedule_id'
        },
        onDelete: 'CASCADE'
      },
      sender_id:{
        type: Sequelize.UUID,
        allowNull:false,
        comment:"정산액 입금자",
        onDelete:'CASCADE',
        references: {
          model: 'participants',
          key: 'participant_id'
        },
        onDelete: 'CASCADE'
      },
      receiver_id:{
        type: Sequelize.UUID,
        allowNull:false,
        comment:"정산액 수급자",
        onDelete:'CASCADE',
        references: {
          model: 'participants',
          key: 'participant_id'
        },
        onDelete: 'CASCADE'
      },
      amount:{
        type: Sequelize.DOUBLE,
        allowNull:false,
        comment:"정산 금액"
      },
      is_paid: {
        type: Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false,
        comment:"정산 여부"
      },
      due_date:{
        type:Sequelize.DATE,
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
    await queryInterface.dropTable('settlements');
  }
};