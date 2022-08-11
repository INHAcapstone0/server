const Participant = require('../controllers/participants');
var router = require('express').Router();

module.exports = (app) => {
    router.post('/', Participant.create);

    router.get('/', Participant.findAll);
    
    //queryString
    router.get("/schedule_id", Participant.findByScheduleId);

    //queryString
    router.get("/participant_id", Participant.findByParticipantId);

    router.delete('/:participant_id',Participant.deleteByParticipantId);

    router.delete('/:schedule_id', Participant.deleteByScheduleId)
    
    app.use("/participants", router);
}
