const router = require('express').Router();
const {
  findUsers, findOneUser, createUser, updateProfile, updateAvatar,
} = require('../controllers/user');

router.get('/', findUsers);

router.get('/:userId', findOneUser);

router.post('/', createUser);

router.patch('/me', updateProfile);

router.patch('/me/avatar', updateAvatar);

module.exports = router;
