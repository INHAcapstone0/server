const {login, register, checkEmail, checkName}=require('../controllers/auth')
var router = require('express').Router();

module.exports = (app) => {

	router.post('/login',login)

	router.post('/register',register)
	
	router.get('/check/email', checkEmail)

	router.get('/check/name', checkName)

	app.use("/auth", router);
}
