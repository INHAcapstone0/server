const path = require("path");
let AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname + "/../config/awsconfig.json"); // 인증
let s3 = new AWS.S3();

let multer = require("multer");
let multerS3 = require('multer-s3');
let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "capstone-storage-server",
        key: function (req, file, next) {
             let extension = path.extname(file.originalname);
             next(null, Date.now().toString() + extension)
        },
        acl: 'public-read-write',
    })
})

module.exports = upload;

