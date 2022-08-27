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
const {accessableToSettlementRequest} = require('../middleware/check-authority')

module.exports = (app) => {
	router.post('/', createSettlement)

	router.get('/', getAllSettlements)

	router.get('/:id', getSettlement)

	router.patch('/:id',accessableToSettlementRequest, updateSettlement)

	router.put('/restore/:id', accessableToSettlementRequest, restoreSettlement)

	router.delete('/:id', accessableToSettlementRequest, deleteSettlement)

	app.use('/settlements', authenticateUser, router)
}
