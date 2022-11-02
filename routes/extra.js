const {
	kakoAPI
}=require('../controllers/extra');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
	router.get('/kakao', kakoAPI)

	app.use("/extra",authenticateUser, router);
}
