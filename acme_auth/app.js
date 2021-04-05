const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());
const {
  models: { User, Note },
} = require('./db');
const path = require('path');

const requireToken = async (req, res, next) => {
  try {
    const user = await User.byToken(req.headers.authorization);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/user/:id/notes', requireToken, async (req, res, next) => {
  try {
  const id = req.params.id;
  const user = req.user;
  if (user.id === parseInt(id, 10)) {
    const notes = await Note.findAll({
      where: {
        userId: id
      }
    });
    res.send(notes);
  } else {
    res.send(console.log("couldn't find notes"));
  }
  
  } catch (err) {
    next(err);
  }
})

app.post('/api/auth', async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/auth', requireToken, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});


app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
