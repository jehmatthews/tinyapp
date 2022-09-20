const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let result = ' ';
  const charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'password'
  }, 
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'password'
  }
};

const findUser = (email) => {
  for (let item in users) {
    const user = users[item];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies['user']
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { 
    user: req.cookies['user']
  };
  res.render('urls_new', templateVars);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  if (findUser(req.body.email, 'email')) {
    res.status(403).send('Email already used')
  };

  const cookieID = req.cookies['user_id'];
  const key = generateRandomString();
  users[key] = {
    id: key,
    email: req.body.email,
    password: req.body.password,
  };

  if (req.body.email === '') {
    res.status(403).send('Eror 404: No email submitted')
  };
  if (req.body.password === '') {
    res.status(403).send('Eror 404: No password submitted')
  };
  res.cookie('user_id', key);
  console.log(users);
  res.redirect('/urls');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    user: req.cookies['user']
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  req.body.id = generateRandomString();
  const {id, longURL} = req.body;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${req.body.id}`);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  res.cookie('user', req.body.user);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user');
  res.redirect('/urls');
});
