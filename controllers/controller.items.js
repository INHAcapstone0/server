
const db = require('../models');
const { toDate } = require('../lib/modules');
const { Item: item, Schedule, User: Receipt } = db;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  const {
    receipt_id,
    item_name,
    item_quantity,
    item_price
  } = req.body;

  if (!(receipt_id && item_name)) {
    res.status(400).send({
      message: "Content cannot be empty!"
    });
    return;
  }

  //receipt_id가 테이블에 존재하는지 확인
  await Receipt.findByPk(receipt_id)
    .then(data => {
      if (data.length == 0) {
        res.status(400).send({
          message: "영수증 ID 정보가 존재하지 않습니다."
        });
        return;
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.message || "Some error occured."
      });
      return;
    })

  const item = {
    receipt_id:receipt_id,
    item_name:item_name,
    item_quantity:item_quantity,
    item_price:item_price,
  }

  item.create(item)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.message || "Some error occured while creating item."
      });
    });
}

exports.findAll = (req, res) => {
  item.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while finding item."
      });
    })
};

//queryString : receipt_id
exports.findByReceiptId = (req, res) => {
  const { receipt_id } = req.query;

  item.findAll({ receipt_id: receipt_id })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while finding items."
      });
    })
};

exports.findByItemName=(req,res)=>{
  const { item_name } = req.query;
  const cond = item_name ? { item_name: { [Op.like]: `%${item_name}%` } } : null;

	item.findAll({ where: cond })
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message: err.message || "Some error occured while finding items."
			});
		})
}

//params: item_id
exports.findOne = (req, res) => {
  const { item_id } = req.params;
  item.findByPk(item_id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.message || "Error retrieving user with item_list=" + item_id
      });
    });
};

//params: item_id
exports.update = (req, res) => {
  const { item_id } = req.params;

  item.update(req.body, {
    where: { id: item_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "스케줄이 수정되었습니다."
        });
      } else {
        res.send({
          message: `Item ID가 ${item_id}인 스케줄을 찾을 수 없습니다.` +
            "req.body가 비어 있는지 체크하세요."
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: "Error updating item with id=" + item_id
      });
    });
};

//params:item_id
exports.delete = (req, res) => {
  const { item_id } = req.params;

  item.destroy({
    where: { id: item_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "An item was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete item with id=${item_id}. Maybe schedule was not found!`
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: "Could not delete item with id=" + item_id
      });
    });
};

exports.deleteAll = (req, res) => {
  item.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Itemss were deleted successfully!` });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Items."
      });
    });
};




