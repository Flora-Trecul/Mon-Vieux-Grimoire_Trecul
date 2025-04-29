// On importe Express et les fonctions d'user + on définit un routeur pour les routes auth
const express = require('express');
const userCtrl = require('../controllers/user');
const { authLimiter } = require('../middleware/limit');

const router = express.Router();

router.use('/', authLimiter);
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;
