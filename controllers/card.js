const Card = require('../models/card');
const { OK } = require('../constants');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const NoAccessError = require('../errors/forbidden-error');

module.exports = {
  findCards(req, res, next) {
    Card.find({})
      .then((cards) => res.send({ cards }))
      .catch(next);
  },
  createCard(req, res, next) {
    const owner = req.user._id;
    const { name, link } = req.body;
    Card.create({ name, link, owner })
      .then((card) => res.send({ card }))
      .catch(next);
  },
  removeCard(req, res, next) {
    Card.findById(req.params.cardId)
      .orFail(new Error('NotValidId'))
      // eslint-disable-next-line consistent-return
      .then((card) => {
        if (card.owner.toString() !== req.user._id) {
          return Promise.reject(new NoAccessError('Невозможно удалить чужую карточку'));
        }
        Card.deleteOne({ _id: card._id })
          .then(() => {
            res.status(OK).send({ card });
          })
          .catch(next);
      })
      .catch((err) => {
        if (err.message === 'NotValidId') {
          throw new NotFoundError('Карточка с указанным _id не найдена.');
        } else if (err.name === 'CastError') {
          throw new BadRequestError('Переданы некорректные данные.');
        } else {
          next(err);
        }
      })
      .catch(next);
  },
  likeCard(req, res, next) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .orFail(new NotFoundError('Карточка с указанным _id не найдена.'))
      .then((card) => {
        res.status(OK).send({ card });
      })
      .catch(next);
  },
  dislikeCard(req, res, next) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } }, // убрать _id из массива
      { new: true },
    )
      .orFail(new NotFoundError('Карточка с указанным _id не найдена.'))
      .then((card) => {
        res.status(OK).send({ card });
      })
      .catch(next);
  },
};
