const scheduler=require('node-schedule')
const db=require('../models')
const {Schedule}=db;
const Op = db.Sequelize.Op

module.exports={
  loadInitialScheduler:async()=>{
    const schedules=await Schedule.findAll({
      where: {
        startAt:{
          [Op.gt]:new Date()
        }
      }
    })
    schedules.forEach(schedule=>{
      global['scheduleStart_'+schedule.id]=scheduler.scheduleJob(schedule.startAt, async function(){
        //FCM method
        console.log(`${schedule.name} start at ${new Date()}`);
        delete global['scheduleStart_'+schedule.id]
      }.bind(null, schedule))

      global['scheduleEnd_'+schedule.id]=scheduler.scheduleJob(schedule.endAt, async function(){
        //FCM method
        console.log(`${schedule.name} end at ${new Date()}`);
        delete global['scheduleEnd_'+schedule.id]
      }.bind(null, schedule))
    })
  },

  createOrFixScheduler:async(schedule)=>{
    if (`scheduleStart_${schedule.id}` in global){ // 기존에 시작 스케줄러에 등록되어 있다면 scheduler cancel 후 삭제
      global[`scheduleStart_${schedule.id}`].cancel()
      delete global['scheduleStart_'+schedule.id]
    }
    if (`scheduleEnd_${schedule.id}` in global){ // 기존에 종료 스케줄러에 등록되어 있다면 scheduler cancel 후 삭제
      global[`scheduleEnd_${schedule.id}`].cancel()
      delete global['scheduleEnd_'+schedule.id]
    }

    global['scheduleStart_'+schedule.id]=scheduler.scheduleJob(schedule.startAt, async function(){
      //FCM method
      console.log(`${schedule.name} start at ${new Date()}`);
      delete global['scheduleStart_'+schedule.id]
    }.bind(null, schedule))

    global['scheduleEnd_'+schedule.id]=scheduler.scheduleJob(schedule.endAt, async function(){
      //FCM method
      console.log(`${schedule.name} end at ${new Date()}`);
      delete global['scheduleEnd_'+schedule.id]
    }.bind(null, schedule))
  },
  deleteScheduler:async(schedule)=>{
    if (`scheduleStart_${schedule.id}` in global){ // 기존에 시작 스케줄러에 등록되어 있다면 scheduler cancel 후 삭제
      global[`scheduleStart_${schedule.id}`].cancel()
      delete global['scheduleStart_'+schedule.id]
    }
    if (`scheduleEnd_${schedule.id}` in global){ // 기존에 종료 스케줄러에 등록되어 있다면 scheduler cancel 후 삭제
      global[`scheduleEnd_${schedule.id}`].cancel()
      delete global['scheduleEnd_'+schedule.id]
    }
  }
}