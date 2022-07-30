
module.exports=(app)=>{
    const participants=require('../controllers/controller.participants');
    var router=require('express').Router();

    router.post('/', participants.create);

    router.get('/', participants.findAll);

    app.use("/api/participant", router);
}
