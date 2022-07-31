'use strict';
const md5 = require('md5');
const { v4: uuidV4} = require('uuid')

module.exports = {
  async up (queryInterface, Sequelize) {
    let sampleUsers = [];
    let sampleIds=[
      '4008b5cb-c626-4a3a-9490-08572249ccf4',
      '44ecb180-bd14-4fcc-8088-e58da95fd984',
      '4fff267a-e427-4bdf-aea4-fe4c0e78de4f',
      '55fc3df3-76a2-457e-9246-7f10d5b18614',
      '5a0f8f63-3a6b-4582-afe8-aa56fb1204cc',
      '63175920-d3fe-40e2-bf69-f6f8083a6936',
      '7790dc0d-ea6c-4cf9-88f8-f6ccfb66ac6e',
      '87d8615e-eeb2-4bb7-a0e9-f621f6f410a9',
      'b19b0334-4553-4b55-b4e8-5afa58aa958b',
      'c510ef47-1239-466e-98fc-e60f4413137a'
    ];
    for(let i = 0; i < 10; i++){
      let obj = {
        id:sampleIds[i], //나중에 랜덤한 UUID값으로 바꿀것 ->id:uuidV4()
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
