//import express
const express = require('express');
//import express router
const router = express.Router();
//import controller sauce
const sauceCtrl = require('../controllers/sauce');
//imports authentication middleware
const auth = require('../middleware/auth');
//imports multer middleware
const multer = require('../middleware/multer-config');

//The CRUD routes
router.get('/', auth, sauceCtrl.getAllSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);

module.exports = router;
