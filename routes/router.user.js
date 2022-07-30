module.exports=(app)=>{
    const users=require('../controllers/controller.users');
    var router=require('express').Router();

    router.post('/', users.create);

    router.get('/', users.findAll);

    app.use("/api/user", router);
}
