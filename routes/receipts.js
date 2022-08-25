const {
	createReceipt,
	getAllReceipts,
	getReceipt,
	updateReceipt,
	restoreReceipt,
	deleteReceipt,
	uploadReceiptImage
} = require('../controllers/receipts');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')
const upload=require('../middleware/upload-image')

module.exports = (app) => {
	router.post('/', createReceipt)

	router.get('/', getAllReceipts)

	router.get('/:id', getReceipt)

	router.patch('/:id', updateReceipt)

	router.patch('/img/upload/:id', upload.single('receipt-img'), uploadReceiptImage)

	router.put('/restore/:id', restoreReceipt)

	router.delete('/:id', deleteReceipt)

	app.use('/receipts', authenticateUser, router)
}
