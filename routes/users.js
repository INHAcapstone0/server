const User = require('../controllers/controller.users');
var router = require('express').Router();

module.exports = (app) => {
    router.post('/', User.create);

    router.get('/', User.findAll);

    router.get("/:user_id", User.findOne);

    router.delete('/:user_id',User.delete);
    app.use("/users", router);
}
