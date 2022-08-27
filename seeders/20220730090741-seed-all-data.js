'use strict';
const bcrypt = require('bcrypt')
const { v4: uuidV4 } = require('uuid')

module.exports = {
  async up(queryInterface, Sequelize) {
    const now= new Date();
    let sampleUsers = [];
    let sampleSchedules = [];
    let sampleReceipts = [];
    let sampleSettlements = [];
    let sampleAlarms = [];
    let sampleItems = [];
    let sampleParticipants = [];

    let userIds = [
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
    let scheduleIds = [
      'e2acdc84-c583-4572-80bb-cf70b275b096',
      '6beb6a32-8ae4-4ad6-a1c2-2dd52304a4df',
      'e4635b40-6fab-4361-84e2-7e6b9df16884',
      '593f3b45-cce6-4f81-898a-7e5c07cd94b7',
      '25f33811-dd10-40fa-92ac-78f3305ee33a',
    ];
    let receiptsIds=[
      '9322e936-88cb-4cd7-9a36-cf877b427b20',
      '735f05e3-894b-498d-91cf-c8409a38a409',
      'f28afe0f-3487-4ce7-939e-0c6a674414b2',
      '09fa0398-b0fc-4697-a510-50eb87ab365e',
      '8dbccf13-b3ec-4616-98df-113907f1098f',
      'afed26ee-fdb9-40e7-9bce-fb5453f39d14',
      'c47fd80b-f7a8-4a61-a92e-e4ee973456a3',
      '8321b4d0-f073-403d-9b67-cc02f5fe6a6b',
      'ffa4071d-6982-4c01-80f7-170872a0012a',
      '4ecc89f9-1ca0-4fee-aab5-0b0459fe0057'
    ];
    let settlementIds=[
      '787220eb-b7f5-4fff-84eb-a0387127bc63',
      '5bff585e-3a10-4783-ac33-c32c7f6b199b',
      'e9bf2a30-1eab-4783-9e85-c1c07c49fda7',
      'ded3cb2f-0ece-48f0-b6c2-ef05619d7df1',
      '80e28f5b-e59b-4041-9131-60651ae005d5',
    ]
    let alarmIds=[
      'bd66d6ed-801b-4d0d-9c88-c7a0febc26ef',
      'd59375fb-1c2a-4a21-9851-ae2422285ac5',
      '3664226f-5bed-4920-b637-226d7f7dbe15',
      'eac80679-f33e-4c6b-831c-05be3063f0f4',
      '5c42b09b-8aa3-48f8-8c04-558547d0f2fa',
      '62a18864-095f-411e-bd76-1be070bd9fd4',
      '998c09ce-c506-4506-bf32-d130971fa892',
      '64078ec7-afca-4e7d-b29a-6910fe96d6e4',
      'a8b4e54a-e538-4c23-b0c1-c23b75f08a3b',
      '11fe2df6-e71e-4351-bb36-aaf62d1f9663'
    ]
    let itemIds=[
      'dce9061c-3174-44dc-8360-be251241344a',
      'cd982e21-dbf0-4aa3-b6e0-51f1240500f2',
      '85c14598-abb2-4d5e-b557-fa8f91d2ab32',
      'ca4d5ade-3970-4013-8f29-ba65530c3897',
      'a538ef62-dd84-43fa-a3b7-667eab2580a0',
      'a9205f72-2fb0-4c03-ae29-b21943de79ef',
      '5d3b073b-619a-4c01-bfec-88cc695322cf',
      'e550a429-3da6-4322-bb92-cc960b6ca8a1',
      '2181e374-7837-410f-85e8-1ce35a8e1ba4',
      'f62603df-f048-42e2-8338-47e1e2744b1e',
      'fce3f728-5b21-4fa6-8c05-9027f7ad7f7a',
      'e19f1a38-78cf-4e90-9cf3-e8890462c6ec',
      '0fe467bf-a511-424e-beed-85079964720a',
      '8827a8b7-de9f-4c53-8dec-a9b993bd7cc0',
      '10041cc9-a565-4ad2-9e7c-3e9cab614c99',
      '7aa9bf20-792d-4982-a556-fb7ffeb87727',
      '3c84da6b-9672-4391-ab05-e86d820491bb',
      '458efac2-6982-4456-a85a-feee7ab9ada7',
      '2c4bca25-5011-486f-b95f-2d9c768d6b8a',
      '8c4399c1-ac71-45f3-a897-be0434b1b000'
    ]

    const salt = await bcrypt.genSalt(10);
    
    for (let i = 0; i < 10; i++) {
      let password = await bcrypt.hash(`rlathfals${i}#`, salt)
      let userObj = {
        id: userIds[i], //나중에 랜덤한 UUID값으로 바꿀것 ->id:uuidV4()
        email: "test" + i + "@example.com",
        name: "테스트유저" + i,
        password: password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sampleUsers.push(userObj)
    }
    await queryInterface.bulkInsert('users', sampleUsers, {});

    let password=await bcrypt.hash(`taylor#1213`, salt)
    let password2=await bcrypt.hash(`wjdtjrdn12#`, salt)
    let customUsers=[
      {
        id: 'a9306475-2465-4eac-87a4-4b8d5c6c4d5b',
        email: "cnwish1@naver.com",
        name: "호스트",
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'a7881fe1-2145-46dc-90c2-f8659def21e4',
        email: "cnwish2@naver.com",
        name: "참가자", 
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      
      {
        id: 'e9bf2a30-1eab-4783-9e85-c1c07c49fda7',
        email: "root@test.com",
        name: "관리자", 
        password:password2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
  ]
  await queryInterface.bulkInsert('users', customUsers, {});

    for (let i = 0; i < 5; i++) {
      let scheduleObj = {
        id:scheduleIds[i],
        name: "테스트스케줄" + i,
        owner_id: userIds[i],
        startAt: new Date(now.setDate(now.getDate() + 1)),
        endAt: new Date(now.setDate(now.getDate() + 4)),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sampleSchedules.push(scheduleObj);
    }
    await queryInterface.bulkInsert('schedules', sampleSchedules, {});

    for (let i = 0; i < 10; i++) {
      let participantObj={
        participant_id: userIds[i],
        schedule_id: scheduleIds[Math.floor(i/2)],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      sampleParticipants.push(participantObj);
    }
    await queryInterface.bulkInsert('participants', sampleParticipants, {});

    for (let i = 0; i < 10; i++) {
      let receiptObj={
        id:receiptsIds[i],
        schedule_id: scheduleIds[Math.floor(i/2)],
        poster_id: userIds[i],
        total_price:i*1000000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      sampleReceipts.push(receiptObj)
    }
    await queryInterface.bulkInsert('receipts', sampleReceipts, {});
    
    for (let i = 0; i < 20; i++) {
      let itemObj={
        id:itemIds[i],
        receipt_id:receiptsIds[Math.floor(i/2)],
        name:`테스트아이템`+i,
        price:i*500000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      sampleItems.push(itemObj)
    }
    await queryInterface.bulkInsert('items', sampleItems, {});

    for (let i = 0; i < 5; i++) {
      let settlementObj={
        id:settlementIds[i],
        schedule_id: scheduleIds[i],
        sender_id:userIds[  i*2  ],
        receiver_id:userIds[  (i*2)+1  ],
        amount:i*1000000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      sampleSettlements.push(settlementObj)
    }
    await queryInterface.bulkInsert('settlements', sampleSettlements, {});

    for (let i = 0; i < 10; i++) {
      let alarmObj={
        id:alarmIds[i],
        user_id:userIds[Math.floor(i/2)],
        alarm_type:'초대',
        message:'테스트메세지'+i,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      sampleAlarms.push(alarmObj)
    }
    await queryInterface.bulkInsert('alarms', sampleAlarms, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('alarms', null, {});
    await queryInterface.bulkDelete('settlements', null, {});
    await queryInterface.bulkDelete('items', null, {});
    await queryInterface.bulkDelete('receipts', null, {});
    await queryInterface.bulkDelete('participants', null, {});
    await queryInterface.bulkDelete('schedules', null, {});
    await queryInterface.bulkDelete('users', null, {});

  }


};
