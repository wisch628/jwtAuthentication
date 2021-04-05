const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
const {
  models: { User },
} = require('./db');
const path = require('path');

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/auth', async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/auth', async (req, res, next) => {
  try {
    const SECRET_KEY = process.env.JWT;
    const dataVerify = jwt.verify(req.headers.authorization, SECRET_KEY);
    console.log(req.headers);
    console.log(dataVerify);
    res.send(await User.byToken(dataVerify));
  } catch (ex) {
    next(ex);
  }
});
//const dataVerify = jwt.verify(token, SECRET_KEY);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
