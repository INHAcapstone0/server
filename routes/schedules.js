module.exports=(app)=>{
    const schedules=require('../controllers/controller.schedules');
    var router=require('express').Router();

    router.post('/', schedules.create);

    router.get('/', schedules.findAll);

    app.use("/schedules", router);
}
