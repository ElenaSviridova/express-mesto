const router = require('express').Router();
const {
  findCards, createCard, removeCard, likeCard, dislikeCard,
} = require('../controllers/card');

router.get('/', findCards);

router.post('/', createCard);

router.delete('/:cardId', removeCard);

router.put('/:cardId/likes', likeCard);

router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
