const { toDate, isValidDate } = require('../lib/modules');
const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const User = db.User;
const Schedule = db.Schedule;
const Op = db.Sequelize.Op;

//추후에 기간 중복에 대한 유효성 검증할 것
exports.createSchedule = async (req, res) => {
  let {
    name,
    owner_id,
    startAt, // yyyymmddhhmmss
    endAt // yyyymmddhhmmss
  } = req.body;

  if (!name || !owner_id || !startAt || !endAt) {
    throw new BadRequestError('모든 값을 입력해주세요.')
  }

  req.body.startAt = toDate(req.body.startAt);
  req.body.endAt = toDate(req.body.endAt);
  
  if (!isValidDate(req.body.startAt) && !isValidDate(req.body.endAt)) {
    throw new BadRequestError('일정 시작일과 종료일을 유효한 타입 [YYYYMMDDhhmmss]으로 입력하세요.')
  } else if (req.body.startAt >= req.body.endAt) {
    throw new BadRequestError('일정 종료시간을 일정 시작시간 이후의 날짜로 입력하세요.')
  }

  const user = await User.findByPk(owner_id)
  if (!user) {
    throw new NotFoundError('소유자 id를 가진 유저가 존재하지 않습니다.')
  }

  // 중복된 스케줄이 존재하면 created를 반환
  const [schedule, created] = await Schedule.findOrCreate({
    where: { owner_id, name },
    defaults: req.body
  });
  
  if(!created){
    throw new BadRequestError('해당 소유자가 이미 생성한 같은 이름의 스케줄이 존재합니다.')
  }

  res.status(StatusCodes.CREATED).json(schedule)
}

exports.getAllSchedules = async(req, res) => {
  const {owner_name, owner_id, name }=req.query;
  const condition={}
  let schedules;

  // owner_name으로 조회할 때
  if(owner_name){
    condition.name= { [Op.like]: `%${owner_name}%` };
    schedules= await Schedule.findAll({
      where:{
        '$User.name$':{[Op.like]:`%${owner_name}%`}
      },
      include: [{
        model: User,
        attributes:[]
      }],
      attributes:['name']
    })
  }else{
    if(owner_id){
      condition.owner_id=owner_id
    }
    if(name){
      condition.name= { [Op.like]: `%${name}%` };
    }
    schedules= await Schedule.findAll({
      where:condition
    });
  }
  if(!schedules.length){
    throw new NotFoundError('스케줄이 존재하지 않습니다.')
  }
  res.status(StatusCodes.OK).json(schedules);
  // owner_name없이 조회할 때
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




