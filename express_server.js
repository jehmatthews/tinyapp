const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

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

const urlsForUser = (id) => {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key].longURL
    }
  }
  return urls;
};

app.get('/', (req, res) => {
  if (!req.session.user_id){
    res.redirect("/login");
  } else {
    res.redirect("/urls")
  }
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
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  if (!req.session.user_id) {
    return res.status(403).send('Login to see URLs');
  } else {
  res.render('urls_index', templateVars);
  };
});

app.get('/urls/new', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  templateVars = {
    user: user
  };

  if (!user) {
    res.redirect('/login')
  }
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id, 
    longURL: urlDatabase[req.params.id], 
    user: users[req.session.user_id]
  };

  if (!req.session.user_id){
    return res.status(403).send("Login in to see URL");
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get('/u/:id', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  const longURL = urlDatabase[req.params.id];
  if (!user) {
    res.send("<html><body>No login</body><html>");
  };
  if (!urlDatabase[req.params.id]) {
    res.send("<html><body>Cannot find ID<body><html>")
  } else {
    res.redirect(longURL)
  };
  return;
});

app.get('/register', (req, res) => {
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
  const check = findUser(req.body.email);

  if(req.body.email === "" || req.body.password === ""){
    return res.status(400).send("Empty fields");
  } else if ( check !== undefined) {
    return res.status(400).send("Email already registered");
  } else if (check === undefined) {
    users[key] = {
      id: key,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10),
    }
  };

  req.session.user_id = key;
  res.redirect('/urls');
  return;
});

app.post('/login', (req, res) => {
  const check = findUser(req.body.email);
  const password = req.body.password;

  if (check === undefined) {
    return res.status(403).send('Email not registered');
  } else if (check.email === req.body.email && bcrypt.compareSync(password, check.hashedPassword)) {
    res.redirect("urls");
  } else if (check.email !== req.body.email) {
    res.status(403).send("Incorrect email, please register");
  } else if (check.password !== req.body.password) {
    res.status(403).send("Incorrect password")
  };
  
  res.redirect('/urls');
  return;
});

app.post('/urls', (req, res) => {
  const cookieID = req.session.user_id;
  const user = users[cookieID];
  const key = generateRandomString();
  
  if (!user) {
    res.send("<html><body>Permission denied<body><html>");
  } else {
    urlDatabase[key] = {
      key: key,
      longUrl: req.body.longURL,
      userID: cookieID
    };
    res.redirect(`/urls/${key}`)
  }
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