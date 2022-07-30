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
			res.status(500).send({
				message: err.message || "Some error occured while creating user."
			});
		});
}

exports.findAll = (req, res) => {
	const { user_email, user_name } = req.query;

	const cond_user_name = user_name ? { user_name: { [Op.like]: `%${user_name}%` } } : null;
	// const cond_user_email=user_email?{user_email:{ [Op.like]: `%${user_email}%`}} : null;
	// const cond=cond_user_name&&cond_user_email;

	User.findAll({ where: cond_user_name })
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
			res.status(500).send({
				message: err.message || "Error retrieving user with user_id=" + user_id
			});
		});
};

//params:user_id
//body:user_pw, user_email
exports.update = (req, res) => {
  const {user_id} = req.params;

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
        message: "Error updating Tutorial with id=" + id
      });
    });
};

//params:user_id
exports.delete = (req, res) => {
  const {user_id} = req.params;

  Tutorial.destroy({
    where: { id: user_id }
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
        message: "Could not delete user with id=" + _user
      });
    });
};

exports.deleteAll = (req, res) => {
  Tutorial.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Tutorials were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};




