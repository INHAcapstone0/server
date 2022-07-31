'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Participants', {
      participant_id:{
        type: Sequelize.UUID,
        comment:"참여자 ID",
        references: {
          model: 'Users',
          key: 'id'
        },
      },
      schedule_id:{
        type: Sequelize.UUID,
        comment:"참여 일정 ID",
        references: {
          model: 'Schedules',
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
    await queryInterface.dropTable('Participants');
  }
};