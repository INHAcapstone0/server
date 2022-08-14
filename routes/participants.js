const {
    createParticipant,
    getAllParticipants,
    restoreParticipant,
    deleteParticipant,
    updateParticipant
} =require('../controllers/participants');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
    router.post('/',createParticipant)

    router.get('/', getAllParticipants)

    router.patch('/:participant_id/:schedule_id', updateParticipant)

    router.post('/restore', restoreParticipant)

    router.delete('/',deleteParticipant)

	app.use("/participants",authenticateUser, router);
}
