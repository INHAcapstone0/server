const {
	createAlarm,
	restoreAlarm,
	updateAlarm,
	deleteAlarm,
	getAlarm,
	getAllAlarms,
	test
} = require('../controllers/alarms');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')
const {accessableToAlarmRequest}=require('../middleware/check-authority')

module.exports = (app) => {
	router.post('/', createAlarm)

	router.get('/', getAllAlarms)

	router.get('/:id', getAlarm)

	// router.patch('/:id', accessableToAlarmRequest, updateAlarm)

	router.put('/restore/:id', restoreAlarm)

	router.delete('/:id', deleteAlarm)

	router.post('/test',test )

	app.use('/alarms', authenticateUser, router)
}
