/* eslint-disable no-underscore-dangle */
// On importe les packages de cryptage et de génération de token + le schéma de données User
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res) => {
  // Syntaxe : bcrypt.hash(string à crypter, nombre de fois où on exécute l'algorithme)
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur enregistré' }))
        .catch((error) => res.status(400).json({ error }));
    })
    // Erreur 500 car erreur de serveur
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res) => {
  // Ne jamais spécifier si l'user est introuvable ou le mot de passe incorrect (donc pas de 404)
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        throw new Error('Request Error');
      } else {
        bcrypt.compare(req.body.password, user.password).then((valid) => {
          if (!valid) {
            throw new Error('Request Error');
          } else {
            // Arguments de jwt.sign :
            // payload (données à encoder) : userId pour que le token corresponde bien à l'user
            // clé pour l'encodage (chaîne aléatoire, longue et complexe lors de la production)
            // configuration : durée de validité du token
            res.status(200).json({
              userId: user._id,
              token: jwt.sign({ userId: user._id }, process.env.TOKEN_KEY, {
                expiresIn: '12h',
              }),
            });
          }
        });
      }
    })
    .catch((error) => {
      if (error.message === 'Request Error') {
        res.status(400).json({ error });
      } else {
        res.status(500).json({ error });
      }
    });
};
