const { assert } = require('chai');

const findUser = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUser', function() {
  it('should return a user with valid email', function() {
    const user = findUser("user2@example.com", 'email', testUsers)
    const expectedUserID = {
      id : "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    };
    assert.deepEqual(user, expectedUserID);
  });
  it('should return undefined if a user is not found', function () {
    const user = findUser("", 'email', testUsers)
    const expectedUserID = {
      id : "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    };
    assert.deepEqual(user, undefined);
  });
});