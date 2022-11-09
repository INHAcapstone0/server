const {
	kakoAPI,
	receiveCodeAndSend,
	myAccount,
	getToken,
	myTranList,
	refreshToken,
	deleteAccount,
	myInfo
}=require('../controllers/extra');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
	router.get('/kakao', kakoAPI)
	// router.get('/authorize',firstAuthorize)
	router.get('/send', receiveCodeAndSend)
	router.get('/token', authenticateUser,getToken)
	router.get('/refresh', refreshToken)
	router.get('/user/me', authenticateUser, myInfo)
	router.get('/account/list',authenticateUser, myAccount)
	router.get('/account/transaction_list/fin_num', myTranList)
	router.post('/account/cancel',deleteAccount)

	app.use("/extra",router);
}
