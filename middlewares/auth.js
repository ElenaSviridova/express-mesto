const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(403)
      .send({ message: 'Необходима авторизация' });
  }
  const token = authorization.replace('Bearer ', '');
  // верифицируем токен
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    // отправим ошибку, если не получилось
    return res
      .status(403)
      .send({ message: 'Необходима авторизация' });
  }
  req.user = payload;// записываем пейлоуд в объект запроса
  console.log("payload", payload)
  next();
};
