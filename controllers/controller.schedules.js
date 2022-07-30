const db=require('../models');
const Schedule=db.schedules;
const Op=db.Sequelize.Op;

exports.create=(req,res)=>{
    if(!req.body.owner_id || !req.body.schedule_name ){
        res.status(400).send({
            message:"Content cannot be empty!"
        });
        return;
    }

    const schedule={
        owner_id:req.body.owner_id,
        schedule_name:req.body.schedule_name
    };

    Schedule.create(schedule)
        .then(data=>{
            res.send(data);
        })
        .catch(err=>{
            res.status(500).send({
                message: err.message || "Some error occured while creating schedule."
            });
        });
}

exports.findAll=(req,res)=>{
    const schedule_name=req.query.schedule_name;
    var cond=schedule_name?{user_name:{ [Op.like]: `%${schedule_name}%`}} : null;

    Schedule.findAll({where:cond})
        .then(data=>{
            res.send(data);
        })
        .catch(err=>{
            res.status(500).send({
                message: err.message || "Some error occured while finding schdules."
            });
        })
}