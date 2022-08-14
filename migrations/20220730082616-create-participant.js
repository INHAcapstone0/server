'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('participants', {
      participant_id:{
        type: Sequelize.UUID,
        comment:"참여자 ID",
        primaryKey:true,
        references: {
          model: 'users',
          key: 'id'
        },
      },
      schedule_id:{
        type: Sequelize.UUID,
        comment:"참여 일정 ID",
        primaryKey:true,
        references: {
          model: 'schedules',
          key: 'id'
        },
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
    await queryInterface.dropTable('participants');
  }
};