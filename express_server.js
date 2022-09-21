const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {

};

const users = {

};

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let result = '';
  const charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const findUser = (email) => {
  for (let item in users) {
    const userEmail = users[item].email;
    if (userEmail === email) {
      return users[item];
    }
  }
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
    user: users[req.cookies.user]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { 
    user: users[req.cookies.user]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    user: users[req.cookies.user]
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
  return;
});

app.get('/register', (req, res) => {
  const cookieID = req.cookies['user'];
  const user = users[cookieID];
  templateVars = {
    urls: urlDatabase,
    user: user
  };
  if (user) {
    res.redirect('/urls')
    return;
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const cookieID = req.cookies['user'];
  const user = users[cookieID];

  templateVars = {
    urls: urlDatabase,
    user: user
  };

  if (user) {
    res.redirect('/urls')
    return;
  };
  res.render('urls_login', templateVars);
});

app.post('/register', (req, res) => {
  const key = generateRandomString();

  if (findUser(req.body.email, 'email')) {
    res.status(403).send('Email already used')
    return;
  };

  users[key] = {
    id: key,
    email: req.body.email,
    password: req.body.password,
  };

  res.cookie('user', users[key].id);
  res.redirect('/urls');
  return;
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const key = generateRandomString();

  users[key] = {
    id: key,
    email: req.body.email,
    password: req.body.password,
  };

  if (!email || !password) {
    return res.status(403).send('Email and/or password missing');
  };

  const user = findUser(email);

  if (!user) {
    return res.status(400).send('That user does not exist');
  };

  if (user.password !== password) {
    return res.status(400).send('Password is incorrect');
  };

  res.cookie('user', users[key].id);
  res.redirect('/urls');
  return;
});

app.post('/urls', (req, res) => {
  req.body.id = generateRandomString();
  const {id, longURL} = req.body;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${req.body.id}`);
  return;
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
  return;
});

app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
  return;
});

app.post('/logout', (req, res) => {
  res.clearCookie('user');
  res.redirect('/urls');
  return;
});