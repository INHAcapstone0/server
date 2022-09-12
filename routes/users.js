const {
	getAllUsers,
	getUser,
	updateUser,
	restoreUser,
	deleteUser,
	uploadUserImage,
	deleteUserImage,
	getUsersNotJoinedInSchedule
}=require('../controllers/users');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')
const {accessableToUserRequest}=require('../middleware/check-authority') // 권한 판별
const upload=require('../middleware/upload-image')

module.exports = (app) => {

	//queryString:name
	router.get('/', getAllUsers);

	router.get('/rest',getUsersNotJoinedInSchedule)

	//params:user_id
	router.get("/:id", accessableToUserRequest, getUser);

	//params:user_id
	//body:user_pw, user_email, user_name
	router.patch('/:id', accessableToUserRequest, updateUser)

	router.patch('/img/upload', upload.single('user-profile'), uploadUserImage)

	router.patch('/img/empty', deleteUserImage)

	//params:user_id
	router.put('/restore/:id', accessableToUserRequest, restoreUser)

	//params:user_id
	router.delete('/:id', accessableToUserRequest, deleteUser);

	app.use("/users",authenticateUser, router);
}
