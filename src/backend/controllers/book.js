/* eslint-disable indent */
/* eslint-disable no-underscore-dangle */
// On importe fs pour la suppression d'image + le schéma de données Book
const fs = require('fs');
const Book = require('../models/Book');

exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.createBook = (req, res) => {
  // On parse l'objet de la requête (c'est une string qu'on veut transformer en objet)
  const bookObject = JSON.parse(req.body.book);
  // On enlève le champ _id car Mongoose en génère un avec le mot-clé "new"
  delete bookObject._id;
  // On enlève le champ userId car on doit utiliser l'userId du token par sécurité
  delete bookObject._userId;

  const book = new Book({
    // opérateur Spread : on copie tous les champs du req.body (au lieu de "title: req.body.title")
    ...bookObject,
    // On récupère l'userId qui a été attaché à l'objet request dans la propriété auth
    userId: req.auth.userId,
    // On génère l'URL de l'image à partir du nom de fichier créé avec multer
    // Protocole (http) + hote (localhost:3000) + dossier de stockage + nom de fichier multer
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: 'Livre enregistré' }))
    .catch((error) => res.status(400).json({ error }));
  // Reste à définir dans app.js une route /images renvoyant vers le dossier images
};

exports.getOneBook = (req, res) => {
  // :id dans la route pour indiquer que l'id est un paramètre
  // findOne pour trouver le livre de la base de données ayant le même id qu'en paramètre
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.modifyBook = (req, res) => {
  // On vérifie s'il y a une image car le traitement n'est pas le même avec ou sans image
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : { ...req.body };

  // Fonction pour modifier le livre
  function updateBook() {
    // updateOne a deux paramètres : l'objet à modifier et la nouvelle version de l'objet
    // On précise deux fois que l'id doit correspondre à celui de l'URL
    // car l'ID dans le corps de la requête peut ne pas être le bon
    Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
      .then(res.status(200).json({ message: 'Livre modifié' }))
      .catch((error) => res.status(400).json({ error }));
  }

  delete bookObject._userId;
  // On cherche l'objet déjà existant dans la base de données
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // On vérifie que l'userId est le même que celui utilisé pour créer le livre
      if (book.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        // On supprime l'ancienne image si l'utilisateur en a mis une nouvelle
        const filename = req.file ? book.imageUrl.split('/images/')[1] : null;
        if (filename !== null) {
          fs.unlink(`images/${filename}`, updateBook);
        } else {
          updateBook();
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        // On récupère le nom du fichier (ce qui est après /images/ dans le path)
        const filename = book.imageUrl.split('/images/')[1];
        // On utilise la méthode asynchrone unlink du package fs pour supprimer l'image
        // Puis callback pour supprimer le livre de la base de données après avoir supprimé l'image
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(res.status(200).json({ message: 'Livre supprimé' }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.rateBook = (req, res) => {
  // Il faut ajouter la note au tableau contenu dans la propriété ratings du Book
  Book.updateOne({ _id: req.params.id }, { ratings: req.body, _id: req.params.id })
    .then((book) => res.status(201).json({ book }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getThreeBestBooks = (req, res) => {
  Book.find()
    .then((books) => {
      // On trie les livres par note moyenne et on renvoie les trois premiers
      const bestBooks = books.sort((x, y) => y.averageRating - x.averageRating).splice(0, 3);
      res.status(200).json(bestBooks);
    })
    .catch((error) => res.status(400).json({ error }));
};
