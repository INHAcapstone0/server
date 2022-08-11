const db = require('../models');
const { toDate } = require('../lib/modules');
const { Receipt, Schedule, User } = db;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  const {
    schedule_id,
    poster_id,
    total_price,
    place_of_payment,
    memo
  } = req.body;

  if (!(schedule_id && poster_id)) {
    res.status(400).send({
      message: "Content cannot be empty!"
    });
    return;
  }

  //schedule_id, poster_id가 테이블에 존재하는지 확인
  await User.findByPk(poster_id)
    .then(data => {
      if (data.length == 0) {
        res.status(400).send({
          message: "영수증 게시자 ID 정보가 존재하지 않습니다."
        });
        return;
      }
    })
    .then(() => {
      Schedule.findByPk(schedule_id)
        .then(data => {
          if (data.length == 0) {
            res.status(400).send({
              message: "스케줄 ID 정보가 존재하지 않습니다."
            });
            return;
          }
        })
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.message || "Some error occured."
      });
      return;
    })

  const receipt = {
    schedule_id: schedule_id,
    poster_id: poster_id,
    total_price: total_price,
    place_of_payment: place_of_payment,
    memo: memo,
  }

  Receipt.create(receipt)
    .then(data => {ß
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.message || "Some error occured while creating receipt."
      });
    });
}

exports.findAll = (req, res) => {
  Recipt.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while finding receipt."
      });
    })
};

//queryString : schedule_id
exports.findByScheduleId = (req, res) => {
  const { schedule_id } = req.query;

  Receipt.findAll({ schedule_id: schedule_id })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while finding receipts."
      });
    })
};

//queryString : poster_id
exports.findByPosterId = (req, res) => {
  const { poster_id } = req.query;

  Receipt.findAll({ poster_id: poster_id })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while finding receipts."
      });
    })
};

//params: receipt_id
exports.findOne = (req, res) => {
  const { receipt_id } = req.params;
  Receipt.findByPk(receipt_id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.message || "Error retrieving user with receipt_id=" + receipt_id
      });
    });
};

//params: receipt_id
exports.update = (req, res) => {
  const { receipt_id } = req.params;

  Receipt.update(req.body, {
    where: { id: receipt_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "스케줄이 수정되었습니다."
        });
      } else {
        res.send({
          message: `schedule_id가 ${receipt_id}인 스케줄을 찾을 수 없습니다.` +
            "req.body가 비어 있는지 체크하세요."
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: "Error updating Receipt with id=" + receipt_id
      });
    });
};

//params:receipt_id
exports.delete = (req, res) => {
  const { receipt_id } = req.params;

  Receipt.destroy({
    where: { id: receipt_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "A Receipt was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete receipt with id=${receipt_id}. Maybe schedule was not found!`
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: "Could not delete receipt with id=" + receipt_id
      });
    });
};

exports.deleteAll = (req, res) => {
  Receipt.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} receipts were deleted successfully!` });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all receipts."
      });
    });
};




