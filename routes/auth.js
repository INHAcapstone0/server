const {login, register}=require('../controllers/auth')
var router = require('express').Router();

module.exports = (app) => {

	router.post('/login',login)
	router.post('/register',register)
	
	app.use("/auth", router);
}
