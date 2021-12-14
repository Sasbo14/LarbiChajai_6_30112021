const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

//package express-rate-limit pour limiter le nombre de tentative de login
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 3,
  message:
    'Vous avez saisi un mot de passe incorrect à 3 reprises. Veuillez réessayer dans 1 minute',
});

router.post('/signup', userCtrl.signup);
router.post('/login', loginLimiter, userCtrl.login);

module.exports = router;
