'use strict';
const md5 = require('md5');
const { v4: uuidV4} = require('uuid')

module.exports = {
  async up (queryInterface, Sequelize) {
    let sampleUsers = [];
    for(let i = 0; i < 10; i++){
      let obj = {
        id:uuidV4(),
        user_email: "test" + i + "@example.com",
        user_name: "testUser" + i,
        user_pw: md5("1234"),
        createdAt:new Date(),
        updatedAt:new Date(),
      };
      sampleUsers.push(obj)
    }

    await queryInterface.bulkInsert('Users', sampleUsers, {});
    
    const userIds= await queryInterface.sequelize.query(
      `SELECT id from Users;`
    );
    let sampleSchedules=[];
    
    for(let i = 0; i < 10; i++){
      let obj = {
        id:uuidV4(),
        schedule_name: "testSchedule" + i,
        owner_id:userIds[0][Math.floor(Math.random() * 10)].id,
        startAt:new Date(),
        endAt:new Date(),
        completeAt:new Date(),
        createdAt:new Date(),
        updatedAt:new Date(),
      };
      sampleSchedules.push(obj)
    }
    
    return queryInterface.bulkInsert('Schedules', sampleSchedules, {});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Schedules', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  } 
};
