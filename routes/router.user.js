const User = require('../controllers/controller.users');
var router = require('express').Router();

module.exports = (app) => {
    router.post('/', User.create);

    router.get('/', User.findAll);

    app.use("/users", router);
}
