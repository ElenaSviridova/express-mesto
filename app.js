const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const userRoutes = require('./routes/user');
const cardRoutes = require('./routes/card');
const { login, createUser } = require('./controllers/user');
const auth = require('./middlewares/auth');
const {
  ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_INTERNAL_SERVER_ERROR, OK,
} = require('./constants');

const { PORT = 3000 } = process.env;

const app = express();

app.use(cookieParser());

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function start() {
  await mongoose.connect('mongodb://localhost:27017/mestodb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
}

start();

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/users', userRoutes);

app.use('/cards', cardRoutes);

app.use((req, res, next) => {
  res.status(ERR_NOT_FOUND).send({ message: 'Запрашиваемый ресурс не найден' });
  next();
});

app.use((err, req, res, next) => {
  if (err.message === 'NotValidId') {
    res.status(ERR_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден.' });
  } else if (err.name === 'CastError') {
    res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные.' });
  } else {
    res.status(ERR_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
