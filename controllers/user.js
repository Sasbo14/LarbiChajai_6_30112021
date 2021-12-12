//encryption package
const bcrypt = require('bcrypt');
//Le package jsonwebtoken pour pouvoir créer et vérifier les tokens d'authentification
const jwt = require('jsonwebtoken');

const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

//User model
const User = require('../models/User');

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
    bcrypt
      .hash(req.body.password, 10)
      .then((hash) => {
        const signupUser = new User({
          email: req.body.email,
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
  //findOne pour trouver l'utilisateur qui correspond à l'email envoyer dans la requête
  User.findOne({ email: req.body.email })
    .then((registeredUser) => {
      if (!registeredUser) {
        return res.status(401).json({ error: 'User not found! !' });
      }
      //On compare le mdp envoyer dans la requête avec le mdp du hash enregistrer dans le registeredUser
      bcrypt
        .compare(req.body.password, registeredUser.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: 'incorrect password !' });
          }
          //Si les identifiants sont valables, on renvoi un userId et le token d'identification
          res.status(200).json({
            userId: registeredUser._id,
            token: jwt.sign(
              { userId: registeredUser._id },
              'RANDOM_TOKEN_SECRET',
              {
                expiresIn: '24h',
              }
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
