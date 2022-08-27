const {
	createSchedule,
	getAllSchedules,
	getSchedule,
	updateSchedule,
	restoreSchedule,
	deleteSchedule
} = require('../controllers/schedules');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')
const { accessableToScheduleRequest } = require('../middleware/check-authority') // 권한 판별

module.exports = (app) => {
	//body:schedule_name, owner_id, startAt, endAt
	router.post('/', createSchedule);

	//no params
	router.get('/', getAllSchedules);

	//params:schedule_id
	router.get("/:id", accessableToScheduleRequest, getSchedule);

	//params:schedule_id
	//body:schedule_name,owner_id, startAt, endAt
	router.patch('/:id', accessableToScheduleRequest, updateSchedule)

	router.put('/restore/:id', accessableToScheduleRequest, restoreSchedule);

	//params:schedule_id
	router.delete('/:id', accessableToScheduleRequest, deleteSchedule);

	app.use("/schedules",authenticateUser, router);
}
