const db = require('../models');
const User = db.User;
const Op = db.Sequelize.Op;
const md5 = require('md5');


exports.create = (req, res) => {
  const { user_email, user_pw, user_name } = req.body;

  if (!user_email || !user_pw || !user_name) {
    res.status(400).send({
      message: "Content cannot be empty!"
    });
    return;
  }

  const user = {
    user_email: user_email,
    user_pw: md5(user_pw),
    user_name: user_name,
  };

  User.create(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      console.log(err.errors[0].message);
      res.status(500).send({
        message: err.errors[0].message || "Some error occured while creating user."
      });
    });
}

exports.findAllByName = (req, res) => {
  const { name } = req.query;

  const condition = name ? { user_name: { [Op.like]: `%${name}%` } } : null;

  User.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occured while finding users."
      });
    })
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
  if (req.body.user_pw) {
    req.body.user_pw = md5(req.body.user_pw);
  }

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






