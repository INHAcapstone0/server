const path = require("path");
const url = require('url')
let AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname + "/../config/awsconfig.json"); // 인증
let s3 = new AWS.S3();

let multer = require("multer");
let multerS3 = require('multer-s3');
let uploadS3 = multer({
	storage: multerS3({
		s3: s3,
		bucket: "capstone-storage-server",
		key: function (req, file, next) {
			let extension = path.extname(file.originalname);
			next(null, file.fieldname + '/' + Date.now().toString() + extension)
		},
		acl: 'public-read-write',
	})
})

let deleteS3 = async (targetURL) => {
	const params={
		Bucket:'capstone-storage-server',
		Key: url.parse(targetURL, true).pathname.slice(1)
	}
	console.log(params)
	try{
		await s3.deleteObject(params, function (err, data) {
			if (err) {
				console.log(err)
			} else {
				console.log('delete success' + data)
			}
		}).promise();
	}catch(e){}
}

module.exports = {
	uploadS3,
	deleteS3
};

