const {
	createReceipt,
	getAllReceipts,
	getReceipt,
	updateReceipt,
	restoreReceipt,
	deleteReceipt,
} = require('../controllers/receipts');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
	router.post('/', createReceipt)

	router.get('/', getAllReceipts)

	router.get('/:id', getReceipt)

	router.patch('/:id', updateReceipt)

	router.put('/restore/:id', restoreReceipt)

	router.delete('/:id', deleteReceipt)

	app.use('/receipts', authenticateUser, router)
}
