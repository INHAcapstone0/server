'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('items', {
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
          model: 'receipts',
          key: 'id'
        },
      },
      name:{
        type:Sequelize.STRING,
        default:'무제',
        comment:"물픔(또는 구매내역) 이름"
      },
      quantity:{
        type:Sequelize.INTEGER,
        defaultValue:1,
        comment:"물품 수량",
        validate:{ // 최대 100개 한도
          min:0,
          max:100
        }
      },
      price:{
        type:Sequelize.INTEGER,
        defaultValue:0,
        comment:"물품 단가",
        validate:{ // 최대 200만원 한도
          min:0,
          max:2000000
        }
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
    await queryInterface.dropTable('items');
  }
};