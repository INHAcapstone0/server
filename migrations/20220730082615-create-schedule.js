'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schedules', {
      id: {
        type: Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        comment:"스케줄 식별번호",
        onDelete: 'CASCADE'
      },
      owner_id:{  
        type:Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        comment:"일정 소유자(제작자)",
        allowNull:false,
      },
      name:{
        type: Sequelize.STRING,
        comment:"일정 이름",
        allowNull:false,
      },
      startAt:{
        type:Sequelize.DATE,
        allowNull:false,
        comment:"일정 시작시간"
      },
      endAt:{
        type:Sequelize.DATE,
        allowNull:false,
        comment:"일정 종료시간(또는 정산 시작시간)"
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
        type: Sequelize.DATE
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('schedules');
  }
};




