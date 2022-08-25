const {
	getAllUsers,
	getUser,
	updateUser,
	restoreUser,
	deleteUser,
	uploadUserImage
}=require('../controllers/users');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')
const upload=require('../middleware/upload-image')

module.exports = (app) => {

	//queryString:name
	router.get('/', getAllUsers);

	//params:user_id
	router.get("/:id", getUser);

	//params:user_id
	//body:user_pw, user_email, user_name
	router.patch('/:id', updateUser)

	router.patch('/img/upload', upload.single('user-profile'), uploadUserImage)

	//params:user_id
	router.put('/restore/:id', restoreUser)

	//params:user_id
	router.delete('/:id', deleteUser);

	app.use("/users",authenticateUser, router);
}
