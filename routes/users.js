const User = require('../controllers/users');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {

	//queryString:name
	router.get('/', User.getUsers);

	//params:user_id
	router.get("/:user_id", User.findOne);

	//params:user_id
	//body:user_pw, user_email, user_name
	router.put('/:user_id', User.update)

	//params:user_id
	router.put('/restore/:user_id', User.restore)

	//params:user_id
	router.delete('/:user_id', User.delete);

	//no params
	router.delete('/', User.deleteAll)

	app.use("/users", authenticateUser, router);
}
