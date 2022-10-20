const scheduler = require('node-schedule')
const db = require('../models')
const { Schedule, Participant, User, Alarm } = db;
const Op = db.Sequelize.Op
const { sendMulticastMessage } = require('../firebase')

const scheduleCreate = async (schedule) => {

  global['scheduleStart_' + schedule.id] = scheduler.scheduleJob(schedule.startAt, async function () {
    let fcm_token_list = []
    let start_alarm_list = []
    // 1. 승인되지 않은 참여자 정보 모두 삭제
    await Participant.destroy(
      {
        where: {
          schedule_id: schedule.id,
          status: {
            [Op.ne]: '승인'
          }
        }
      }
    )
    // 2. 승인된 참여자들에 대한 푸쉬알림 및 알람 생성
    let users = await User.findAll({
      inclde: [{
        model: Participant,
        where: {
          schedule_id: schedule.id
        },
        attributes: []
      }]
    })

    users.forEach(user => {
      if (user.device_token) {
        fcm_token_list.push(user.device_token)
      }
      start_alarm_list.push({
        user_id: user.id,
        alarm_type: '일정 시작',
        message: `${schedule.name} 일정이 시작되었습니다!`
      })
    })
    try {
      if (fcm_token_list.length) {
        sendMulticastMessage({
          notification: {
            "title": "일정 시작",
            "body": `${schedule.name} 일정이 시작되었습니다!`
          },
          data: {
            type: '일정 시작'
          },
          tokens: fcm_token_list
        })
      }
    } catch (error) {
      console.log(error)
    }
    await Alarm.bulkCreate(start_alarm_list)
    console.log(`${schedule.name} start at ${new Date()}`);
    delete global['scheduleStart_' + schedule.id]
  }.bind(null, schedule))

  global['scheduleEnd_' + schedule.id] = scheduler.scheduleJob(schedule.endAt, async function () {
    let fcm_token_list = []
    let end_alarm_list = []

    // 참여자들에 대한 푸쉬알림 및 알람 생성
    let users = await User.findAll({
      inclde: [{
        model: Participant,
        where: {
          schedule_id: schedule.id
        },
        attributes: []
      }]
    })

    users.forEach(user => {
      if (user.device_token) {
        fcm_token_list.push(user.device_token)
      }
      end_alarm_list.push({
        user_id: user.id,
        alarm_type: '일정 종료',
        message: `${schedule.name} 일정이 종료되었습니다.`
      })
    })
    try {
      if (fcm_token_list.length) {
        sendMulticastMessage({
          notification: {
            "title": "일정 종료",
            "body": `${schedule.name} 일정이 종료되었습니다.`
          },
          data: {
            type: '일정 종료'
          },
          tokens: fcm_token_list
        })
      }
    } catch (error) {
      console.log(error)
    }

    await Alarm.bulkCreate(end_alarm_list)
    console.log(`${schedule.name} end at ${new Date()}`);
    delete global['scheduleEnd_' + schedule.id]
  }.bind(null, schedule))
}

const loadInitialScheduler = async () => {
  const schedules = await Schedule.findAll({
    where: {
      startAt: {
        [Op.gt]: new Date()
      }
    }
  })
  for (const schedule of schedules) {
    console.log(schedule.name)
    await scheduleCreate(schedule)
  }
}

const createOrFixScheduler = async (schedule) => {
  await deleteScheduler(schedule)
  await scheduleCreate(schedule)
}

const deleteScheduler = async (schedule) => {
  if (`scheduleStart_${schedule.id}` in global) { // 기존에 시작 스케줄러에 등록되어 있다면 scheduler cancel 후 삭제
    global[`scheduleStart_${schedule.id}`].cancel()
    delete global[`scheduleStart_${schedule.id}`]
  }
  if (`scheduleEnd_${schedule.id}` in global) { // 기존에 종료 스케줄러에 등록되어 있다면 scheduler cancel 후 삭제
    global[`scheduleEnd_${schedule.id}`].cancel()
    delete global[`scheduleEnd_${schedule.id}`]
  }
}

module.exports = {
  scheduleCreate,
  loadInitialScheduler,
  createOrFixScheduler,
  deleteScheduler
}
