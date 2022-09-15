'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    /*
      User와 N:1
      Schedule과 N:1
     */
    static associate(models) {
      this.belongsTo(models.User,{
        foreignKey:"participant_id",
        onDelete: 'CASCADE'
      });
      this.belongsTo(models.Schedule,{
        foreignKey:"schedule_id",
        onDelete: 'CASCADE'
      });
      this.hasMany(models.Settlement,{
        foreignKey:"schedule_id",
        sourceKey:"schedule_id",
        onDelete: 'CASCADE'
      })
      this.hasMany(models.Settlement,{
        foreignKey:"sender_id",
        sourceKey:"participant_id",
        onDelete: 'CASCADE'
      })
      this.hasMany(models.Settlement,{
        foreignKey:"receiver_id",
        sourceKey:"participant_id",
        onDelete: 'CASCADE'
      })
    }
  };
  Participant.init({
    participant_id:{
      type: DataTypes.UUID,
      comment:"참여자 ID",
      primaryKey:true,
      onDelete:'CASCADE'
    },
    schedule_id:{
      type: DataTypes.UUID,
      comment:"참여 일정 ID",
      primaryKey:true,
      onDelete:'CASCADE'
    },
    status: {
      type: DataTypes.ENUM('대기 중', '승인', '거절'),
      defaultValue:'대기 중',
      comment: "참가 요청 상태"
    },
  },
  {
    sequelize,
    modelName:"Participant",
    tableName:"participants",
    timestamps:true, // createAt, updateAt field 활성화
  });
  // queryInterface.addConstraint('Users', ['firstName', 'lastName'], {
  //   type: 'primary key',
  //   name: 'users_pkey'
  // });
  return Participant;
};