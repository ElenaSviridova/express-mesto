const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_INTERNAL_SERVER_ERROR, OK,
} = require('../constants');

module.exports = {
  login(req, res) {
    const { email, password } = req.body;
    User.findUserByCredentials(email, password)
      .then((user) => {
        const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
        return res
          .cookie('jwt', token, {
            // token - наш JWT токен, который мы отправляем
            maxAge: 3600000,
            httpOnly: true,
          })
          .end();
      })
      .catch((err) => {
        res.status(401).send({ message: err.message });
      });
  },
  getUserInfo(req, res) {
    User.findById(req.user._id)
      .orFail(new Error('NotValidId'))
      .then((user) => {
        res.send({ name: user.name, about: user.about })
      })
      .catch((err) => {
        if (err.message === 'NotValidId') {
          res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
        } else if (err.name === 'CastError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы куку некорректные данные.' });
        } else {
          res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },
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
    const {
      name, about, avatar, email, password,
    } = req.body;
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name, about, avatar, email, password: hash,
      }))
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
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
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
    User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
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
