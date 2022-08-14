const {
    createParticipant,
    getAllParticipants,
    restoreParticipant,
    deleteParticipant,
} =require('../controllers/participants');
var router = require('express').Router();
const authenticateUser=require('../middleware/authentication')

module.exports = (app) => {
    router.post('/',createParticipant)

    router.get('/', getAllParticipants)

    router.post('/restore', restoreParticipant)

    router.delete('/',deleteParticipant)

	app.use("/participants", router);
}
