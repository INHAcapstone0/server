const {
	createReceipt,
	getAllReceipts,
	getReceipt,
	updateReceipt,
	restoreReceipt,
	deleteReceipt,
	uploadReceiptImage,
	test
} = require('../controllers/receipts');
var router = require('express').Router();
const authenticateUser = require('../middleware/authentication')
const uploadS3 = require('../middleware/s3-upload-image')
const upload=require('../middleware/local-upload-image')
const { accessableToReceiptRequest } = require('../middleware/check-authority') // 권한 판별


module.exports = (app) => {
	router.post('/', createReceipt)

	router.get('/', getAllReceipts)

	router.get('/:id',
		accessableToReceiptRequest, getReceipt)

	router.patch('/:id',
		accessableToReceiptRequest, updateReceipt)

	router.patch('/img/upload/:id',
		accessableToReceiptRequest, uploadS3.single('receipt-img'), uploadReceiptImage)

	router.put('/restore/:id',
		accessableToReceiptRequest, restoreReceipt)

	router.delete('/:id',
		accessableToReceiptRequest, deleteReceipt)

	router.post('/test', upload.single('file'), test)

	app.use('/receipts', authenticateUser, router)
}