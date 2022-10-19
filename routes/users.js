const {
	getAllUsers,
	getUser,
	updateUser,
	restoreUser,
	deleteUser,
	uploadUserImage,
	deleteUserImage,
	getUsersNotJoinedInSchedule,
	registerUserDeviceToken
}=require('../controllers/users');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')
const {accessableToUserRequest}=require('../middleware/check-authority') // 권한 판별
const {uploadS3}=require('../middleware/s3')

module.exports = (app) => {

	//queryString:name
	router.get('/', getAllUsers);

	router.get('/rest',getUsersNotJoinedInSchedule)

	//params:user_id
	router.get("/:id", accessableToUserRequest, getUser);

	//params:user_id
	//body:user_pw, user_email, user_name
	router.patch('/:id', accessableToUserRequest, updateUser)

	router.patch('/img/upload', uploadS3.single('user-profile'), uploadUserImage)

	router.patch('/img/empty', deleteUserImage)

	router.patch('/device/token',registerUserDeviceToken)

	//params:user_id
	router.put('/restore/:id', accessableToUserRequest, restoreUser)

	//params:user_id
	router.delete('/:id', accessableToUserRequest, deleteUser);

	router.post('/test',test)

	app.use("/users",authenticateUser, router);
}
