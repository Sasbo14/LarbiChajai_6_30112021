//import expres
const express = require('express');
//import express router
const router = express.Router();
//import user controller
const userCtrl = require('../controllers/user');

//express-rate-limit package to limit the number of login attempts
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 3,
});

router.post('/signup', userCtrl.signup);
router.post('/login', loginLimiter, userCtrl.login);

module.exports = router;
