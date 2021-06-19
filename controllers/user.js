const User = require('../models/user');
const {
  ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_INTERNAL_SERVER_ERROR, OK,
} = require('../constants');

module.exports = {
  findUsers(req, res) {
    User.find({})
      .then((users) => res.send({ data: users }))
      .catch((error) => {
        res.status(ERR_INTERNAL_SERVER_ERROR).send({ error });
      });
  },
  findOneUser(req, res) {
    User.findById(req.params.userId)
      .orFail(new Error('NotValidId'))
      .then((user) => {
        res.status(OK).send({ user });
      })
      .catch((err) => {
        if (err.message === 'NotValidId') {
          res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
        } else if (err.name === 'CastError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
        } else {
          res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },
  createUser(req, res) {
    const { name, about, avatar } = req.body;
    User.create({ name, about, avatar })
      .then((user) => res.send({ user }))
      .catch((error) => {
        if (error.name === 'ValidationError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
          return;
        }
        res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
  },
  updateProfile(req, res) {
    const { name, about } = req.body;
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: true }, { runValidators: true })
      .then((user) => {
        if (user === null) {
          res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
          return;
        }
        res.status(OK).send({ user });
      })
      .catch((error) => {
        if (error.name === 'CastError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
          return;
        }
        res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
  },
  updateAvatar(req, res) {
    const { avatar } = req.body;
    User.findByIdAndUpdate(req.user._id, { avatar }, { new: true }, { runValidators: true })
      .then((user) => {
        if (user === null) {
          res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
          return;
        }
        res.status(OK).send({ user });
      })
      .catch((error) => {
        if (error.name === 'CastError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
          return;
        }
        res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
  },
};
