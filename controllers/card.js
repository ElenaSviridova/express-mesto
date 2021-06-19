const Card = require('../models/card');
const {
  ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_INTERNAL_SERVER_ERROR, OK
} = require('../constants');

module.exports = {
  findCards(req, res) {
    Card.find({})
      .then((cards) => res.send({ cards }))
      .catch(() => res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' }));
  },
  createCard(req, res) {
    const owner = req.user._id;
    const { name, link } = req.body;
    Card.create({ name, link, owner })
      .then((card) => res.send({ card }))
      .catch((error) => {
        if (error.name === 'ValidationError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
          return;
        }
        res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
  },
  removeCard(req, res) {
    Card.findByIdAndDelete(req.params.cardId)
      .then((card) => {
        if (!card) {
          res.status(ERR_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
          return;
        }
        res.status(OK).send({ card });
      })
      .catch(() => {
        res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
  },
  likeCard(req, res) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .then((card) => {
        if (!card) {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка.' });
          return;
        }
        res.status(OK).send({ card });
      })
      .catch(() => res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' }));
  },
  dislikeCard(req, res) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } }, // убрать _id из массива
      { new: true },
    )
      .then((card) => {
        if (!card) {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка.' });
          return;
        }
        res.status(OK).send({ card });
      })
      .catch(() => res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' }));
  },
};
