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
  // Message sécuriaire par défaut si erreur d'authentification
  // Il ne faut pas préciser si l'utilisateur n'est pas inscrit ou si le mot de passe est incorrect
  const errorMsg = 'Identifiant et/ou mot de passe incorrect(s)';
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res.status(401).json({ message: errorMsg });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res.status(401).json({ message: errorMsg });
            } else {
              // Arguments de jwt.sign :
              // payload (données à encoder) : userId pour que le token corresponde bien à l'user
              // clé pour l'encodage (chaîne aléatoire, longue et complexe lors de la production)
              // configuration : durée pour l'expiration du token
              res.status(200).json({
                userId: user._id,
                // token aussi dans le dotenv
                token: jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', {
                  expiresIn: '24h',
                }),
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
