const {
	kakoAPI,
	test
}=require('../controllers/extra');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
	router.get('/kakao', kakoAPI)
	router.get('/test', test)
	app.use("/extra", router);
}
