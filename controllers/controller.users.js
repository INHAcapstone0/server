const db=require('../models');
const User=db.users;
const Op=db.Sequelize.Op;
const md5=require('md5');

exports.create=(req,res)=>{
    if(!req.body.user_id || !req.body.user_pw || !req.body.user_name){
        res.status(400).send({
            message:"Content cannot be empty!"
        });
        return;
    }

    const user={
        user_id:req.body.user_id,
        user_pw:md5(req.body.user_pw),
        user_name:req.body.user_name,
        user_tel:req.body.user_tel
    };

    User.create(user)
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
    const user_name=req.query.user_name;
    var cond=user_name?{user_name:{ [Op.like]: `%${user_name}%`}} : null;

    User.findAll({where:cond})
        .then(data=>{
            res.send(data);
        })
        .catch(err=>{
            res.status(500).send({
                message: err.message || "Some error occured while finding users."
            });
        })
}