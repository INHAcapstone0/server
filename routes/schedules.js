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

module.exports = (app) => {
	//body:schedule_name, owner_id, startAt, endAt
	router.post('/', createSchedule);

	//no params
	router.get('/', getAllSchedules);

	//params:schedule_id
	router.get("/:id", getSchedule);

	//params:schedule_id
	//body:schedule_name,owner_id, startAt, endAt
	router.patch('/:id', updateSchedule)

	router.put('/restore/:id', restoreSchedule);
	//params:schedule_id

	router.delete('/:id', deleteSchedule);

	app.use("/schedules", router);
}
