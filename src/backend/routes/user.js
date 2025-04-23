// On importe Express et les fonctions d'user + on définit un routeur pour les routes auth
const express = require('express');
const userCtrl = require('../controllers/user');

const router = express.Router();

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
