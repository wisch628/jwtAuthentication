const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const { STRING } = Sequelize;
const config = {
  logging: false,
};
const bcrypt = require('bcrypt');
const saltRounds = 10;

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost/acme_db',
  config
);

const User = conn.define('user', {
  username: STRING,
  password: STRING,
});

const Note = conn.define('note', {
  text: STRING
});

Note.belongsTo(User);
User.hasMany(Note);

User.byToken = async (token) => {
  try {
    const SECRET_KEY = process.env.JWT;
    const verifiedToken = jwt.verify(token, SECRET_KEY);
    const user = await User.findByPk(verifiedToken.userId);
    if (user) {
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  } catch (ex) {
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async ({ username, password }) => {
  const SECRET_KEY = process.env.JWT;
  const user = await User.findOne({
    where: {
      username
    },
  });
  const pwValid = bcrypt.compareSync(password, user.password);
  if (user && pwValid === true) {
    const token = jwt.sign({ userId: user.id }, SECRET_KEY);
    return token;
  }
  const error = Error('bad credentials');
  error.status = 401;
  throw error;
};

User.beforeCreate(async (user, options) => {
const salt = bcrypt.genSaltSync(saltRounds);
user.password = bcrypt.hashSync(user.password, salt);

})

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw' },
    { username: 'moe', password: 'moe_pw' },
    { username: 'larry', password: 'larry_pw' },
  ];
  const notes = [
    { text: 'blahblah' },
    { text: 'testing 123' },
    { text: 'so much text!!!' }
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );

  const [note1, note2, note3] = await Promise.all(
    notes.map((note) => Note.create(note))
  );
await lucy.setNotes([note1, note2]);
await moe.setNotes([note3])


  return {
    users: {
      lucy,
      moe,
      larry,
      note1,
      note2, 
      note3
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
    Note
  },
};
