const {
	createAlarm,
	restoreAlarm,
	updateAlarm,
	deleteAlarm,
	getAlarm,
	getAllAlarms,
} = require('../controllers/alarms');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
	router.post('/', createAlarm)

	router.get('/', getAllAlarms)

	router.get('/:id', getAlarm)

	router.patch('/:id', updateAlarm)

	router.put('/restore/:id', restoreAlarm)

	router.delete('/:id', deleteAlarm)

	app.use('/alarms', authenticateUser, router)
}
