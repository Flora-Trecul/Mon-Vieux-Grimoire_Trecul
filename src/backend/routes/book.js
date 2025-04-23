/* eslint-disable no-underscore-dangle */
// On importe Express + les middlewares d'authentification et gestion de fichier
// On importe les fonctions liées aux routes book + on définit un routeur pour ces routes
const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

const router = express.Router();

router.get('/', bookCtrl.getAllBooks);
// D'abord auth pour accéder à la route si l'utilisateur est identifié
// + multer pour spécifier le format de la requête puis appliquer les instructions du controller
router.post('/', auth, multer, bookCtrl.createBook);
router.get('/bestrating', bookCtrl.getThreeBestBooks);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.rateBook);

module.exports = router;
