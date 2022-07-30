const db=require('../models');
const Participant=db.participants;
const Op=db.Sequelize.Op;

exports.create=(req,res)=>{
    if(!req.body.participant_id || !req.body.schedule_id){
        res.status(400).send({
            message:"Content cannot be empty!"
        });
        return;
    }

    const schedule={
        participant_id:req.body.user_id,
        schedule_id:req.body.schedule_id
    };

    Participant.create(schedule)
        .then(data=>{
            res.send(data);
        })
        .catch(err=>{
            res.status(500).send({
                message: err.message || "Some error occured while creating user."
            });
        });
}

exports.findAll=(req,res)=>{
    const participant_id=req.query.participant_id;
    var cond=participant_id?{participant_id:{ [Op.like]: `%${participant_id}%`}} : null;

    Participant.findAll({where:cond})
        .then(data=>{
            res.send(data);
        })
        .catch(err=>{
            res.status(500).send({
                message: err.message || "Some error occured while finding users."
            });
        })
}