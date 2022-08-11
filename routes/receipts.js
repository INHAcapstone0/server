const Receipt = require('../controllers/receipts');
var router = require('express').Router();

module.exports = (app) => {
	router.post('/', Receipt.create);

	router.get('/', Receipt.findAll);

	router.get('/:receipt_id', Receipt.findOne);

	//queryString
	router.get("/schedule_id", Receipt.findByScheduleId);

	//queryString
	router.get("/poster_id", Receipt.findByPosterId);

	router.put("/:receipt_id", Receipt.update);

	router.delete('/:poster_id', Receipt.delete);

	router.delete('/', Receipt.deleteAll)

	app.use("/receipts", router);
}
