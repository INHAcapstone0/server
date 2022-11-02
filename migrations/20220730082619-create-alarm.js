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
        allowNull:false,
        comment: "유저 ID",
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      alarm_type: {
        type: Sequelize.ENUM('초대', '정산 확인 요청','정산 확인 완료', '영수증 업로드', '일정 시작', '일정 종료'),
        allowNull:false,
        comment: "알람 타입"
      },
      message: {
        type: Sequelize.STRING,
        allowNull:false,
        comment: "알람 내용 수량"
      },
      // checked: {
      //   type: Sequelize.BOOLEAN,
      //   allowNull:false,
      //   defaultValue: false,
      //   comment: "알람 체크 여부",
      // },
      data:{
        type: Sequelize.STRING,
        comment: "알람 추가 데이터"
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