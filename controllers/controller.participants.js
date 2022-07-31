const db = require('../models');
const {Participant,User,Schedule} = db;

const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
	const { schedule_id, participant_id } = req.body;

	if (!schedule_id || !participant_id) {
		res.status(400).send({
			message: "Content cannot be empty!"
		});
		return;
	}

  //schedule_id, participant_id가 테이블에 존재하는지 확인
  await User.findByPk(participant_id)
    .then(data=>{
      if(data.length==0){
        res.status(400).send({
          message: "참여자 ID 정보가 존재하지 않습니다."
        });
        return;
      }
    })
    .then(()=>{
      Schedule.findByPk(schedule_id)
        .then(data=>{
          if(data.length==0){
            res.status(400).send({
              message: "스케줄 ID 정보가 존재하지 않습니다."
            });
            return;
          }
        })
    })
    .catch(err=>{
      console.log(err);
      res.status(500).send({
				message: err.message || "Some error occured."
			});
      return;
    })

	const participant = {
		schedule_id: schedule_id,
		participant_id: participant_id,
	};

	Participant.create(participant)
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message: err.message || "Some error occured while creating participant."
			});
		});
}

exports.findAll = (req, res) => {
	Participant.findAll()
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message: err.message || "Some error occured while finding participants."
			});
		})
};

//queryString : schedule_id
exports.findByScheduleId = (req, res) => {
	const  {schedule_id} = req.query;
  
	Participant.findAll({ schedule_id:schedule_id })
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message: err.message || "Some error occured while finding participants."
			});
		})
};

exports.findByParticipantId = (req, res) => {
	const  {participant_id} = req.query;
  
	Participant.findAll({ participant_id:participant_id })
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message: err.message || "Some error occured while finding participants."
			});
		})
};

//params:participant_id
exports.deleteByParticipantId = (req, res) => {
  const {participant_id} = req.params;
  
  Participant.destroy({
    where: { participant_id: participant_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "A participant was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete participant with id=${participant_id}. Maybe participant was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete participant with id=" + participant_id
      });
    });
};
exports.deleteByScheduleId = (req, res) => {
  const {participant_id: schedule_id} = req.params;
  
  Participant.destroy({
    where: { schedule_id: schedule_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "A participant was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete participant with id=${schedule_id}. Maybe participant was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete participant with id=" + schedule_id
      });
    });
};

exports.deleteAll = (req, res) => {
  Participant.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} participants were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all participants."
      });
    });
};




