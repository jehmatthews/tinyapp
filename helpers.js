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

module.exports = { findUser, generateRandomString };