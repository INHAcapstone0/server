'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('alarms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        comment: "알람 식별번호"
      },
      user_id: {
        type: Sequelize.UUID,
        comment: "유저 ID",
        references: {
          model: 'users',
          key: 'id'
        },
      },
      alarm_type: {
        type: Sequelize.STRING,
        enum: ['초대', '정산', '일정 시작', '일정 종료'],
        comment: "알람 타입"
      },
      message: {
        type: Sequelize.STRING,
        comment: "알람 내용 수량"
      },
      checked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: "알람 체크 여부",
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
    await queryInterface.dropTable('alarms');
  }
};