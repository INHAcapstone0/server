'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Schedules', {
      id: {
        type: Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        comment:"스케줄 식별번호"
      },
      schedule_name:{
        type: Sequelize.STRING,
        comment:"일정 이름",
        //정규표현식 작성 추가할것
      },
      owner_id:{  
        type:Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        comment:"일정 소유자(제작자)",
      },
      completeAt:{
        type:Sequelize.DATE,
        allowNull:true,
        defaultValue:null,
        comment:"정산 마감시각"
        //정규표현식 작성 추가할것
      },
      startAt:{
        type:Sequelize.DATE,
        allowNull:true,
        defaultValue:null,
        comment:"일정 시작시간"
      },
      endAt:{
        type:Sequelize.DATE,
        allowNull:true,
        defaultValue:null,
        comment:"일정 종료시간"
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
    await queryInterface.dropTable('Schedules');
  }
};