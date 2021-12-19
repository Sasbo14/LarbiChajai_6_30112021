//encryption package
const bcrypt = require('bcrypt');
//The jsonwebtoken package to be able to create and verify authentication tokens
const jwt = require('jsonwebtoken');
//password-validator package to strengthen the password
const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

//User model
const User = require('../models/User');

require('dotenv').config();
const envdbToken = process.env.DB_TOKEN;

//pattern want password
passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(20) // Maximum length 100
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 2 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(['Passw0rd', 'Password123']); // Blacklist these values

//registration of new users
exports.signup = (req, res, next) => {
  //If the password matches the pattern
  if (passwordSchema.validate(req.body.password)) {
    //bcrypt hash function and we sell the password 10 times
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        //Create user
        const signupUser = new User({
          email: req.body.email,
          password: hash,
        });
        //save in the database
        signupUser
          .save()
          .then(() => res.status(201).json({ message: 'User created !' }))
          .catch((error) =>
            res
              .status(400)
              .json({ message: 'email that already exists in the database' })
          );
      })
      .catch((error) => res.status(500).json({ error }));
  } else {
    return res.status(400).json({
      message: `Weak password: ${passwordSchema.validate('req.body.password', {
        list: true,
      })}`,
    });
  }
};

//login existing users
exports.login = (req, res, next) => {
  //findOne to find the user that matches the email send in the request
  User.findOne({ email: req.body.email })
    .then((registeredUser) => {
      if (!registeredUser) {
        return res.status(401).json({ error: 'User not found! !' });
      }
      //compare the password sent in the request with the password of the hash registered in the registeredUser
      bcrypt
        .compare(req.body.password, registeredUser.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: 'incorrect password !' });
          }
          //If the identifiers are valid, we return a userId and the identification token
          res.status(200).json({
            userId: registeredUser._id,
            token: jwt.sign({ userId: registeredUser._id }, `${envdbToken}`, {
              expiresIn: '24h',
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
