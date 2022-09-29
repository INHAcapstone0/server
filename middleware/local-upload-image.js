const path = require("path");

let multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "data/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;

