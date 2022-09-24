const findUser = (email, key, users) => { // finds user by their email
  for (const user in users) {
    let userEmail = users[user];
    if (email === userEmail[key]) {
      return users[user];
    }
  }
  return undefined;
};

module.exports = findUser;