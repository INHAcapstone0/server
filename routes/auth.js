const {login, register, checkEmail, checkName, refresh}=require('../controllers/auth')

var router = require('express').Router();

module.exports = (app) => {

	router.post('/login',login)

	router.post('/register',register)
	
	router.get('/check/email', checkEmail)

	router.get('/check/name', checkName)

	router.get('/refresh', refresh)

	app.use("/auth", router);
}
