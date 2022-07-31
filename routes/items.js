const Item = require('../controllers/controller.items');
var router = require('express').Router();

module.exports = (app) => {
	//body:user_email, user_pw, user_name
	router.post('/', Item.create);

	//no params
	router.get('/', Item.findAll);

	//params:
	router.get('/:item_id', Item.findOne);

	//queryString
	router.get("/name", Item.findByItemName);

	router.put("/:item_id", Item.update);

	router.delete('/:item_id', Item.delete);

	router.delete('/', Item.deleteAll)

	app.use("/items", router);
}
