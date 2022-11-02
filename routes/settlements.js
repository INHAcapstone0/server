const {
	createSettlement,
	restoreSettlement,
	updateSettlement,
	deleteSettlement,
	getAllSettlements,
	getSettlement,
	settlementCheckRequest,
	getSettlementsOfSchedule
} = require('../controllers/settlements');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')
const {accessableToSettlementRequest} = require('../middleware/check-authority')

module.exports = (app) => {
	router.post('/', createSettlement)

	router.post('/push', settlementCheckRequest)

	router.get('/', getAllSettlements)

	router.get('/:id', getSettlement)

	router.patch('/:id',accessableToSettlementRequest, updateSettlement)

	router.put('/restore/:id', accessableToSettlementRequest, restoreSettlement)

	router.delete('/:id', accessableToSettlementRequest, deleteSettlement)

	router.get('/custom/mine', getSettlementsOfSchedule)

	app.use('/settlements', authenticateUser, router)
}
