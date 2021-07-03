const router = require('express').Router();
const {
  findUsers, findOneUser, getUserInfo, updateProfile, updateAvatar,
} = require('../controllers/user');

router.get('/', findUsers);

router.get('/me', getUserInfo);

router.get('/:userId', findOneUser);

router.patch('/me', updateProfile);

router.patch('/me/avatar', updateAvatar);

module.exports = router;
