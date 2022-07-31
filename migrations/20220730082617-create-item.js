'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Items', {
      id:{
        type:Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        comment:"물품(또는 구매) 식별번호"
      },
      receipt_id:{
        type: Sequelize.UUID,
        comment:"영수증 ID",
        references: {
          model: 'Receipts',
          key: 'id'
        },
      },
      item_name:{
        type:Sequelize.STRING,
        comment:"물픔(또는 구매내역) 이름"
        //정규 표현식 추가
      },
      item_quantity:{
        type:Sequelize.INTEGER,
        defaultValue:1,
        comment:"물품 수량"
        //constraints 추가
      },
      item_price:{
        type:Sequelize.INTEGER,
        defaultValue:0,
        comment:"물품 단가"
        //constraints 추가
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
    await queryInterface.dropTable('Items');
  }
};