'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        comment:"유저 식별번호"
      },
      user_email:{
        type: Sequelize.STRING,
        unique:true,
        validate:{
          isEmail:true,
        },
        comment:"이메일"
        //정규표현식 작성 추가할것
      },
      user_pw: {
        type: Sequelize.STRING,
        comment:"비밀번호(해싱된 32자리 string), md5로 해싱"
        //정규표현식 작성 추가할것
      },
      user_name:{
        type:Sequelize.STRING,
        unique:true,
        comment:"유저 이름"
        //정규표현식 작성 추가할것
      },
      login_failed_cnt:{
        type: Sequelize.INTEGER,
        defaultValue:0,
        comment:"로그인 실패 횟수"
        //constraint 추가(5 이하의 숫자)
      },
      is_locked:{
        type:Sequelize.BOOLEAN,
        defaultValue:false,
        comment:"계정 잠김 여부(로그인 5회 실패)"
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
    await queryInterface.dropTable('Users');
  }
};