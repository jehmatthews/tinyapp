const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

const { findUser, generateRandomString } = require('./helpers');

app.use(cookieSession({ 
  name: 'session', 
  keys: ['key1']
}));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// for URLs created
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// for Users created
const users = {  
    userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlsForUser = (id) => { // returns object based on matching of url and id
  const urls = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

// ----- Get requests -----
// Startup Get functions
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// Redirects to /urls if logge in, if not logged in, directed to /login
app.get('/', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];

  if (user) {
    res.redirect('/urls');
  };

  if (!user) {
    res.redirect('/login');
  };
});

// Get request for URL's, shows URL's belonging to user logged in
app.get('/urls', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];

  const templateVars = { 
    urls: urlsForUser(cookieID),
    user: user
  };

  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// Get request for new URL's, checks to make sure user is logged in before displaying
app.get('/urls/new', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  const templateVars = {
    user: user
  };

  if (!user) {
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

// Get request for the edit page, if id found, can alter
app.get('/urls/:id', (req, res) => {
  const { id } = req.params;
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  const templateVars = {
    url: urlDatabase[id],
    user: user
  };

  if (!findUser(cookieID, 'userID', urlDatabase)) {
    res.send("<html><body>Permission denied</body></html>");
  };

  res.render("urls_show", templateVars);
});

// Get request for redirect based on longURL
app.get('/u/:id', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  const longURL = urlDatabase[req.params.id].longUrl;

  if (!user) {
    res.send("<html><body>No login</body></html>");
  };
  if (!urlDatabase[req.params.id]) {
    res.send("<html><body>Cannot find ID</body></html>");
  } else {
    res.redirect(longURL);
  };
});

// Get request for registering new user, if registered, directs to urls
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

// Get request for login from valid user, if valid, logs in and redirects to /urls
app.get('/login', (req, res) => {
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
  res.render('urls_login', templateVars);
});

// ----- Post requests ----- 
// Post when registering new user, if valid creds, redirect to /urls
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

// Post when logging in user, if valid creds, redirect to /urls
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

// Post when adding new URL's, adds new url to database
app.post('/urls', (req, res) => {
  const key = generateRandomString();
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  
  if (!user) {
    return res.send("<html><body>Permission denied</body></html>");
  }; 

  urlDatabase[key] = {
    id: key,
    longUrl: req.body.longURL,
    userID: cookieID
  };

  return res.redirect(`/urls/${key}`);
});

// Post when deleting user URL
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
  return;
});

// Post when editing user URL
app.post('/urls/:id/edit', (req, res) => {
  urlDatabase[req.params.id].longUrl = req.body.longUrl;
  res.redirect('/urls');
  return;
});

// Post when logging out
app.post('/logout', (req, res) => {
  req.session.user_id = undefined;
  res.redirect('/urls');
  return;
});

// Port # listening on
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});