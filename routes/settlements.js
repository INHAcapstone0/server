const {
	createSettlement,
	restoreSettlement,
	updateSettlement,
	deleteSettlement,
	getAllSettlements,
	getSettlement,
} = require('../controllers/settlements');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
	router.post('/', createSettlement)

	router.get('/', getAllSettlements)

	router.get('/:id', getSettlement)

	router.patch('/:id', updateSettlement)

	router.put('/restore/:id', restoreSettlement)

	router.delete('/:id', deleteSettlement)

	app.use('/settlements', authenticateUser, router)
}
