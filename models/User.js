//user schema creation
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//plugin to have a unique email for each user
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
