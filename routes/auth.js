const {
	login, 
	register, 
	checkEmail, 
	checkName, 
	refresh,
	authMail,
	logout,
	issueTempPassword,
	test
}=require('../controllers/auth')
const authenticateUser=require('../middleware/authentication')
var router = require('express').Router();

module.exports = (app) => {

	router.post('/login',login)

	router.post('/logout',authenticateUser,logout)

	router.post('/register',register)
	
	router.get('/check/email', checkEmail)

	router.get('/check/name', checkName)

	router.get('/refresh', refresh)

	router.post('/mail', authMail)

	router.post('/mail/password', issueTempPassword)

	router.get('/test', test)
	app.use("/auth", router);
}
