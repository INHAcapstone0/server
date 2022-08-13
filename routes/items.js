const {
	createItem,
	restoreItem,
	updateItem,
	deleteItem,
	getAllItems,
	getItem,
} = require('../controllers/items');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
	router.post('/', createItem)

	router.get('/', getAllItems)

	router.get('/:id', getItem)

	router.patch('/:id', updateItem)

	router.put('/restore/:id', restoreItem)

	router.delete('/:id', deleteItem)

	app.use('/items', authenticateUser, router)
}
