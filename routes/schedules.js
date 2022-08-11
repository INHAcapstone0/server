const Schedule = require('../controllers/schedules');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
	//body:schedule_name, owner_id, startAt, endAt
	router.post('/', Schedule.createSchedule);

	//no params
	router.get('/', Schedule.getAllSchedules);

	//params:schedule_id
	router.get("/:id", Schedule.getSchedule);

	//params:schedule_id
	//body:schedule_name,owner_id, startAt, endAt
	router.patch('/:id', Schedule.updateSchedule)

	router.put('/restore/:id', Schedule.restoreSchedule);
	//params:schedule_id

	router.delete('/:id', Schedule.deleteSchedule);

	//no params
	// router.delete('/', Schedule.deleteAll)

	app.use("/schedules", router);
}
