//user schema creation
const mongoose = require('mongoose');
//import mongoose-unique-validator
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

//validator applied to schema, plugin to have a unique email for each user
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
