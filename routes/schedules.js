const Schedule = require('../controllers/schedules');
var router = require('express').Router();

module.exports = (app) => {
	//body:schedule_name, owner_id, startAt, endAt
	router.post('/', Schedule.create);

	//no params
	router.get('/', Schedule.findAll);

	//queryString : name
	router.get('/schedule-name', Schedule.findAllByScheduleName);

	//queryString : id
	router.get('/owner', Schedule.findAllByOwnerId);

	//params:schedule_id
	router.get("/:schedule_id", Schedule.findOne);

	//params:schedule_id
	//body:schedule_name,owner_id, startAt, endAt
	router.put('/:schedule_id', Schedule.update)

	//params:schedule_id
	router.delete('/:schedule_id', Schedule.delete);

	//no params
	router.delete('/', Schedule.deleteAll)

	app.use("/schedules", router);
}
