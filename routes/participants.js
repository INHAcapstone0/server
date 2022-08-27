const {
    createParticipant,
    getAllParticipants,
    restoreParticipant,
    deleteParticipant,
    updateParticipant
} = require('../controllers/participants');
var router = require('express').Router();
const authenticateUser = require('../middleware/authentication')
const { accessableToParticipantRequest } = require('../middleware/check-authority') // 권한 판별

module.exports = (app) => {
    router.post('/', createParticipant)

    router.get('/', getAllParticipants)

    router.patch('/:participant_id/:schedule_id',
        accessableToParticipantRequest, updateParticipant)

    router.post('/restore/:participant_id/:schedule_id',
        accessableToParticipantRequest, restoreParticipant)

    router.delete('/:participant_id/:schedule_id',
        accessableToParticipantRequest, deleteParticipant)

    app.use("/participants", authenticateUser, router);
}
