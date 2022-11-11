const {
	kakoAPI,
	receiveCodeAndSend,
	myAccount,
	getToken,
	myTranList,
	refreshToken,
	deleteAccount,
	myInfo,
	test2,
	test1
}=require('../controllers/extra');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
	router.get('/kakao', kakoAPI)
	// router.get('/authorize',firstAuthorize)
	router.get('/send', receiveCodeAndSend)
	router.get('/token', authenticateUser,getToken)
	router.get('/refresh', authenticateUser, refreshToken)
	router.get('/user/me', authenticateUser, myInfo)
	router.get('/account/list',authenticateUser, myAccount)
	router.get('/account/transaction_list/fin_num', myTranList)
	router.post('/account/cancel',deleteAccount)

	router.get('/test1', test1)
	router.get('/test2', test2)
	app.use("/extra",router);
}
