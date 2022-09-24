const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const findUser = require('./helpers');

app.use(cookieSession({ 
  name: 'session', // where cookies are encrypted
  keys: ['key1']
}));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// for URLs created
const urlDatabase = {

};

// for Users created
const users = {

};

function generateRandomString() { // function that gives a 6 char id to cookie and short URLs
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let result = '';
  const charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlsForUser = (id) => { // returns object based on matching of url and id
  const urls = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urls[urlDatabase[url].key] = urlDatabase[url];
    }
  }
  return urls;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get('/', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];

  if (user) {
    res.redirect('/urls');
  };

  if (!user) {
    res.redirect('/login');
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];

  templateVars = { 
    url: urlsForUser(cookieID),
    user: user
  };

  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  templateVars = {
    user: user
  };

  if (!user) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const { id } = req.params;
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  const templateVars = {
    id,
    urls: urlDatabase,
    user: user
  };

  if (!findUser(cookieID, 'userID', urlDatabase)) {
    res.send("<html><body>Permission denied</body></html>");
  };

  res.render("urls_show", templateVars);
});

app.get('/u/:id', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  const longURL = urlDatabase[req.params.id].longURL;
  if (!user) {
    res.send("<html><body>No login</body></html>");
  };
  if (!urlDatabase[req.params.id]) {
    res.send("<html><body>Cannot find ID</body></html>")
  } else {
    res.redirect(longURL)
  };
});

app.get('/register', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  templateVars = {
    urls: urlDatabase,
    user: user
  };
  if (user) {
    res.redirect('/urls');
    return;
  };
  res.render('urls_register', templateVars);
});

app.get('/login', (req, res) => {
  const cookieID = req.session.user_id;
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
  const hashPassword = bcrypt.hashSync(req.body.password, 10);

  if(req.body.email === "" || req.body.password === ""){
    res.status(403).send("Empty fields");
  };

  if (findUser(req.body.email, 'email', users)) {
    res.status(403).send('Email already registered');
  };

  users[key] = {
    id: key,
    email: req.body.email,
    password: hashPassword
  };

  req.session.user_id = key;
  res.redirect('/urls');
  return;
});

app.post('/login', (req, res) => {
  const user = findUser(req.body.email, 'email', users);

  if (findUser(req.body.email, 'email', users) && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
  } else if (!findUser(req.body.email, 'email', users)) {
    res.status(400).send('Email not found');
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send('Password incorrect');
  };
  
  res.redirect('/urls');
  return;
});

app.post('/urls', (req, res) => {
  const key = generateRandomString();
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  
  if (!user) {
    res.send("<html><body>Permission denied</body></html>");
  } else {
    urlDatabase[key] = {
      key: key,
      longUrl: req.body.longURL,
      userID: cookieID
    };
    res.redirect(`/urls/${key}`);
  };
  return;
});


app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
  return;
});

app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
  return;
});

app.post('/logout', (req, res) => {
  req.session.user_id = undefined;
  res.redirect('/urls');
  return;
});