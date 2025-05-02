// On importe Express + le package Mongoose + les variables d'environnement
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
// On importe le path de notre serveur (pour accéder au dossier /images)
const path = require('path');
// On importe les routes api/book et api/auth
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

// On se connecte à la base de données MongoDB (avec un profil de test par sécurité)
// Utiliser dotenv pour les identifiants
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_IDENTIFIERS}@monvieuxgrimoire.lwwk9m3.mongodb.net/?retryWrites=true&w=majority&appName=MonVieuxGrimoire`,
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('La connexion à MongoDB a échoué.'));

// On utilise la méthode express() pour créer une application Express
const app = express();

// Middleware pour réceptionner toutes les données envoyées au format json dans l'objet req
app.use(express.json());

// Middleware qui définit les autorisations d'accès à l'API pour la Cross-Origin Request
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization',
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
// On indique que la route /images est statique
// Et qu'elle renvoie au sous-dossier images dans le répertoire du serveur (_dirname)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware pour gérer les erreurs en dehors des controllers (erreurs Multer notamment)
// eslint-disable-next-line no-unused-vars, consistent-return
app.use((error, req, res, next) => {
  if (error.message === 'Not an Image') {
    return res.status(400).json({ error });
  }
  res.status(500).json({ error });
});

// On exporte l'application en tant que module pour l'utiliser dans le fichier du serveur Node
module.exports = app;
