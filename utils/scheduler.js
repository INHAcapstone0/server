const scheduler=require('node-schedule')
const db=require('../models')
const {Schedule}=db;
const Op = db.Sequelize.Op

module.exports={
  loadInitialSchedule:async()=>{
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
  }
}