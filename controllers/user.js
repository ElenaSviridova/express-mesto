const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { OK } = require('../constants');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');

module.exports = {
  login(req, res, next) {
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
      .catch(next);
  },
  getUserInfo(req, res, next) {
    User.findById(req.user._id)
      .orFail(new NotFoundError('Пользователь с указанным _id не найден.'))
      .then((user) => {
        res.send({ name: user.name, about: user.about });
      })
      .catch(next);
  },
  findUsers(req, res, next) {
    User.find({})
      .then((users) => res.send({ data: users }))
      .catch(next);
  },
  findOneUser(req, res, next) {
    User.findById(req.params.userId)
      .orFail(new NotFoundError('Пользователь с указанным _id не найден.'))
      .then((user) => {
        res.status(OK).send({ user });
      })
      .catch(next);
  },
  createUser(req, res, next) {
    const {
      name, about, avatar, email, password,
    } = req.body;
    bcrypt.hash(password, 10)
      .then((hash) => User.create({
        name, about, avatar, email, password: hash,
      }))
      .then((user) => res.send({ user }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          throw new BadRequestError('Переданы некорректные данные при создании пользователя');
        } else if (err.name === 'MongoError') {
          throw new ConflictError('Ошибка базы данных');
        } else {
          next(err);
        }
      })
      .catch(next);
  },
  updateProfile(req, res, next) {
    const { name, about } = req.body;
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
      .then((user) => {
        res.status(OK).send({ user });
      })
      .catch(next);
  },
  updateAvatar(req, res, next) {
    const { avatar } = req.body;
    User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
      .then((user) => {
        res.status(OK).send({ user });
      })
      .catch(next);
  },
};
