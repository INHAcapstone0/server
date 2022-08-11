const db = require('../models');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const User = db.User;
const Op = db.Sequelize.Op;

exports.getUsers = async (req, res) => {
  const { name } = req.query;

  console.log(name)
  const condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
  
  const users= await User.findAll({ where: condition })

  if(!users){
    throw new NotFoundError('유저가 존재하지 않습니다.')
  }

  delete users.password
  
  res.status(StatusCodes.OK).json(users)
};

exports.findOne = (req, res) => {
  const { user_id } = req.params;

  User.findByPk(user_id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: err.message || "Error retrieving user with user_id=" + user_id
      });
    });
};

exports.update = (req, res) => {
  const { user_id } = req.params;

  User.update(req.body, {
    where: { id: user_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "A user was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update user with user_id=${user_id}. Maybe user was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.errors[0].message ||"Error updating user."
      });
    });
};

exports.restore = (req, res) => {
  const { user_id } = req.params;

  User.restore({ where: { id: user_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Successfully restore the user."
        });
      } else {
        res.send({
          message: `Cannot restore user with user_id=${user_id}. Maybe user was not found.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error on restoring user."
      })
    });
}

exports.delete = (req, res) => {
  const { user_id } = req.params;

  User.destroy({
    where: { id: user_id },
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "A user was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete user with id=${user_id}. Maybe user was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message||"Could not delete user with id=" + user_id
      });
    });
};

exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};






