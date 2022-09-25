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

const findUser = (email, key, users) => { // finds user by their email
  for (const user in users) {
    let userEmail = users[user];
    if (email === userEmail[key]) {
      return users[user];
    }
  }
  return undefined;
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
      urls[url] = urlDatabase[url];
    }
  }
  return urls;
};

module.exports = { urlDatabase, users, findUser, generateRandomString, urlsForUser };