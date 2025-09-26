class User {
  constructor({ username, hashedPassword, createdAt }) {
    this.username = username;
    this.hashedPassword = hashedPassword;
    this.createdAt = createdAt;
  }
}

module.exports = User;
