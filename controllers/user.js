//encryption package
const bcrypt = require('bcrypt');

//package de crypto-js pour chiffrer l'email
const cryptoJs = require('crypto-js');

//Le package jsonwebtoken pour pouvoir créer et vérifier les tokens d'authentification
const jwt = require('jsonwebtoken');

const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

//User model
const User = require('../models/User');

require('dotenv').config();
const envdbToken = process.env.DB_TOKEN;
const envdbKey = process.env.DB_CRYPTOEMAIL;

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

exports.signup = (req, res, next) => {
  if (passwordSchema.validate(req.body.password)) {
    //chiffrement de l'email
    const cryptoEmail = cryptoJs
      .HmacSHA256(req.body.email, `${envdbToken}`)
      .toString();
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const signupUser = new User({
          email: cryptoEmail,
          password: hash,
        });
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

exports.login = (req, res, next) => {
  const cryptoEmail = cryptoJs
    .HmacSHA256(req.body.email, `${envdbToken}`)
    .toString();

  //findOne pour trouver l'utilisateur qui correspond à l'email envoyer dans la requête
  User.findOne({ email: cryptoEmail })
    .then((registeredUser) => {
      if (!registeredUser) {
        return res.status(401).json({ error: 'User not found! !' });
      }
      //On compare le mdp envoyer dans la requête avec le mdp du hash enregistrer dans le registeredUser
      bcrypt
        .compare(req.body.password, registeredUser.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ message: 'incorrect password !' });
          }
          //Si les identifiants sont valables, on renvoi un userId et le token d'identification
          res.status(200).json({
            userId: registeredUser._id,
            //la métode sign()  du package  jsonwebtoken  utilise une clé secrète pour encoder un token qui peut contenir un payload personnalisé et avoir une validité limitée.
            token: jwt.sign({ userId: registeredUser._id }, `${envdbToken}`, {
              expiresIn: '24h',
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
