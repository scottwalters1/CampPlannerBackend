class User {
  constructor({ username, password, createdAt }) {
    this.username = username;
    this.password = password;
    this.createdAt = createdAt;
  }
}

module.exports = User;
