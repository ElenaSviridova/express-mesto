const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const cardRoutes = require('./routes/card');

const { PORT = 3000 } = process.env;

const app = express();

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

app.use((req, res, next) => {
  req.user = {
    _id: '60cb15550d34e0084861eec6',
  };
  next();
});

app.use('/users', userRoutes);

app.use('/cards', cardRoutes);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

start();
