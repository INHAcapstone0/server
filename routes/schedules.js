const {
	test,
	createSchedule,
	getAllSchedules,
	getSchedule,
	updateSchedule,
	restoreSchedule,
	deleteSchedule,
	getMyApprovedSchedule
} = require('../controllers/schedules');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')
const { accessableToScheduleRequest, readableToScheduleRequest } = require('../middleware/check-authority') // 권한 판별

module.exports = (app) => {
	//body:schedule_name, owner_id, startAt, endAt
	router.post('/', createSchedule);

	//no params
	router.get('/', getAllSchedules);

	router.get('/status/',getMyApprovedSchedule)
	//params:schedule_id
	router.get("/:id", readableToScheduleRequest, getSchedule);

	//params:schedule_id
	//body:schedule_name,owner_id, startAt, endAt
	router.patch('/:id', updateSchedule)

	router.put('/restore/:id', accessableToScheduleRequest, restoreSchedule);

	//params:schedule_id
	router.delete('/:id', accessableToScheduleRequest, deleteSchedule);

	router.post('/test',test)
	app.use("/schedules",authenticateUser, router);
}
