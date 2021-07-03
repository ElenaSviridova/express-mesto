const Card = require('../models/card');
const {
  ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_INTERNAL_SERVER_ERROR, OK,
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
    Card.findById(req.params.cardId)
      .orFail(new Error('NotValidId'))
      .then((card) => {
        if (card.owner.toString() !== req.user._id) {
          console.log("kuku");
          return Promise.reject(new Error('Невозможно удалить чужую карточку'));
        }
        Card.deleteOne({ _id: card._id })
          .then(() => {
            res.status(OK).send({ card });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        if (err.message === 'NotValidId') {
          res.status(ERR_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
        } else if (err.name === 'CastError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
        } else if (err.message === 'Невозможно удалить чужую карточку') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Невозможно удалить чужую карточку' });
        } else {
          res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },
  likeCard(req, res) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .orFail(new Error('NotValidId'))
      .then((card) => {
        res.status(OK).send({ card });
      })
      .catch((err) => {
        if (err.message === 'NotValidId') {
          res.status(ERR_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
          return;
        }
        res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
  },
  dislikeCard(req, res) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } }, // убрать _id из массива
      { new: true },
    )
      .orFail(new Error('NotValidId'))
      .then((card) => {
        res.status(OK).send({ card });
      })
      .catch((err) => {
        if (err.message === 'NotValidId') {
          res.status(ERR_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена.' });
        } else if (err.name === 'CastError') {
          res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
        } else {
          res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
        }
      });
  },
};
