const db = require('../models');
const { toDate, isValidDate } = require('../lib/modules');
const { Schedule, User } = db;
const Op = db.Sequelize.Op;

//추후에 기간 중복에 대한 유효성 검증할 것
exports.create = async (req, res) => {
  let {
    schedule_name,
    owner_id,
    startAt, // yyyymmddhhmmss
    endAt // yyyymmddhhmmss
  } = req.body;

  if (!(schedule_name && owner_id && startAt && endAt)) {
    res.status(400).send({
      message: "Content cannot be empty!"
    });
    return;
  }

  startAt = toDate(startAt);
  endAt = toDate(endAt);

  if (!(isValidDate(startAt) && isValidDate(endAt))) {
    res.status(400).send({
      message: "일정 시작일과 종료일을 유효한 타입 [YYYYMMDDhhmmss]으로 입력하세요."
    });
    return;
  } else if (startAt >= endAt) {
    res.status(400).send({
      message: "일정 종료시간을 일정 시작시간 이후의 날짜로 입력하세요."
    });
    return;
  }

  var user = await User.findByPk(owner_id)
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured."
      });
      return null;
    });

  if (!user) {
    res.status(400).send({
      message: "Owner ID 정보가 존재하지 않습니다."
    });
    return;
  }

  await Schedule.findAll({
    where: {
      schedule_name: schedule_name,
      owner_id: owner_id,
      startAt: startAt,
      endAt: endAt,
    }
  })
    .then(data => {
      if (data.length!=0) {
        res.status(400).send({
          message: "중복된 기간의 같은 이름의 스케줄이 존재합니다."
        });
        return;
      } else {
        const schedule = {
          schedule_name: schedule_name,
          owner_id: owner_id,
          startAt: startAt,
          endAt: endAt,
        }
        Schedule.create(schedule)
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message: err.message || "Some error occured while creating schedule."
            });
          });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while creating schedule."
      });
    });
}

exports.findAll = (req, res) => {
  Schedule.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while finding users."
      });
    })
};

exports.findAllByScheduleName = (req, res) => {
  const { name } = req.query;
  
  const cond = name ? { schedule_name: { [Op.like]: `%${name}%` } } : null;

  Schedule.findAll({ where: cond })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while finding users."
      });
    })
};

exports.findAllByOwnerId = (req, res) => {
  const { id } = req.query;

  Schedule.findAll({ owner_id: id })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while finding schedule."
      });
    })
};

exports.findOne = (req, res) => {
  const { schedule_id } = req.params;
  Schedule.findByPk(schedule_id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.message || "Error retrieving user with schedule_id=" + schedule_id
      });
    });
};

exports.update = (req, res) => {
  const { schedule_id } = req.params;

  Schedule.update(req.body, {
    where: { id: schedule_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "스케줄이 수정되었습니다."
        });
      } else {
        res.send({
          message: `schedule_id가 ${schedule_id}인 스케줄을 찾을 수 없습니다.` +
            "req.body가 비어 있는지 체크하세요."
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.errors[0].message||"Error updating schedule"
      });
    });
};

exports.delete = (req, res) => {
  const { schedule_id } = req.params;

  Schedule.destroy({
    where: { id: schedule_id },
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "A Schedule was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete schedule with id=${schedule_id}. Maybe schedule was not found!`
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.errors[0].message|| "Could not delete schedule with id=" + schedule_id
      });
    });
};

exports.deleteAll = (req, res) => {
  Schedule.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} schedules were deleted successfully!` });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all schedules."
      });
    });
};




