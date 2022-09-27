'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        comment:"유저 식별번호"
      },
      email:{
        type: Sequelize.STRING,
        unique:true,
        validate:{
          isEmail:true,
        },
        comment:"이메일"
      },
      password: {
        type: Sequelize.STRING,
        comment:"비밀번호(해싱된 32자리 string), bcrypt로 해싱"
      },
      name:{
        type:Sequelize.STRING,
        unique:true,
        comment:"유저 이름, 특수문자 제외 2자 이상 10자 이하"
        //정규표현식 작성 추가할것
      },
      img_url:{
        type:'VARCHAR(3000)',
        allowNull:true,
        comment:"유저 프로필 사진 URL 주소"
        //정규표현식 작성 추가할것
      },
      login_failed_cnt:{
        type: Sequelize.INTEGER,
        defaultValue:0,
        comment:"로그인 실패 횟수",
        validate:{
          max:5
        }
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
      device_token:{
        type:'VARCHAR(1000)',
        allowNull:true,
        comment:"유저 디바이스 토큰"
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};