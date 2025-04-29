/* eslint-disable indent */
/* eslint-disable no-underscore-dangle */
// On importe fs pour la suppression d'image + le schéma de données Book
const fs = require('fs');
const sharp = require('sharp');
const Book = require('../models/Book');

exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};

exports.getOneBook = (req, res) => {
  // findOne pour trouver le livre de la base de données ayant le même id qu'en paramètre
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        throw new Error('Unauthorized');
      } else {
        // On récupère le nom du fichier (ce qui est après /images/ dans le path)
        const filename = book.imageUrl.split('/images/')[1];
        // On utilise la méthode asynchrone unlink du package fs pour supprimer l'image
        // Puis callback pour supprimer le livre de la base de données après avoir supprimé l'image
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(res.status(200).json({ message: 'Livre supprimé' }))
            .catch((error) => res.status(500).json({ error }));
        });
      }
    })
    .catch((error) => {
      // 403 : l'utilisateur est authentifié mais n'a pas les droits d'accès
      if (error.message === 'Unauthorized') {
        res.status(403).json({ error });
      } else {
        res.status(404).json({ error });
      }
    });
};

// Fonction pour optimiser l'image dans createBook et updateBook
async function handleImg(req) {
  // On crée une nouvelle image optimisée et on supprime l'image d'origine
  const inputPath = req.file.path;
  try {
    const outputPath = `images/${req.file.filename.split('.')[0]}.webp`;
    await sharp(inputPath).resize(405).webp({ quality: 20 }).toFile(outputPath);
    await fs.promises.unlink(inputPath);
  } catch {
    throw new Error();
  }
}

exports.createBook = async (req, res) => {
  try {
    // On appelle la fonction pour optimiser l'image
    await handleImg(req);

    // On parse l'objet de la requête (c'est une string qu'on veut transformer en objet)
    const bookObject = JSON.parse(req.body.book);
    // On enlève le champ _id car Mongoose en génère un avec le mot-clé "new"
    delete bookObject._id;
    // On enlève le champ userId car on doit utiliser l'userId du token par sécurité
    delete bookObject._userId;

    const book = new Book({
      // opérateur Spread : on copie tous les champs du body (au lieu de "title: req.body.title")
      ...bookObject,
      // On récupère l'userId qui a été attaché à l'objet request dans la propriété auth
      userId: req.auth.userId,
      // On génère l'URL de l'image à partir du nom de fichier créé avec multer
      // Protocole (http) + hote (localhost:3000) + dossier de stockage + nom de fichier multer
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename.split('.')[0]
      }.webp`,
    });

    // On ajoute le livre à la base de données avec save()
    book.save().then(() => res.status(201).json({ message: 'Livre enregistré' }));
  } catch (error) {
    if (error.message === 'Not an Image') {
      res.status(400).json({ error });
    } else {
      res.status(500).json({ error });
    }
  }
};

// eslint-disable-next-line consistent-return
exports.modifyBook = async (req, res) => {
  try {
    // On récupère le body de la requête et on traite l'image s'il y en a une
    const bookObject = req.file ? { ...JSON.parse(req.body.book) } : { ...req.body };
    if (req.file) {
      await handleImg(req);
      bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${
        req.file.filename.split('.')[0]
      }.webp`;
    }
    delete bookObject._userId;

    // On cherche l'objet déjà existant dans la base de données
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      throw new Error('Not Found');
    }
    // On vérifie que l'userId est le même que celui utilisé pour créer le livre
    if (book.userId !== req.auth.userId) {
      throw new Error('Unauthorized');
    }
    // On supprime l'ancienne image si l'utilisateur en a mis une nouvelle puis on update le livre
    if (req.file) {
      const filename = book.imageUrl.split('/images/')[1];
      await fs.promises.unlink(`images/${filename}`);
    }
    // updateOne prend 2 paramètres : objet à modifier + nouvelle version
    // On remet req.params.id car l'_id du body pourrait ne pas être le bon
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    res.status(200).json({ message: 'Livre modifié' });
  } catch (error) {
    switch (error.message) {
      case 'Unauthorized':
        res.status(403).json({ error });
        break;
      case 'Not Found':
        res.status(404).json({ error });
        break;
      default:
        res.status(403).json({ error });
    }
  }
};

exports.rateBook = (req, res) => {
  // On cherche l'objet déjà existant dans la base de données
  const bookId = req.params.id;
  Book.findOne({ _id: bookId })
    .then((book) => {
      // On vérifie que l'utilisateur n'a pas déjà posté une note
      if (book.ratings.some((rating) => rating.userId === req.auth.userId)) {
        throw new Error('Request Error');
      }
      // On récupère la note et on la met au format requis ("grade : Nb" au lieu de "rating: Nb")
      const rate = req.body;
      rate.grade = rate.rating;
      delete rate.rating;

      // On remplace l'userId de la requête par celui du token d'authentification
      delete rate._userId;
      rate.userId = req.auth.userId;

      // On ajoute la nouvelle note aux notes déjà existantes
      const rates = book.ratings;
      rates.push(rate);

      // On calcule la moyenne de toutes les notes et on met à jour averageRating
      const grades = rates.map(({ grade }) => grade);
      let sumGrades = 0;
      grades.forEach((grade) => {
        sumGrades += grade;
      });
      // On affiche au maximum deux décimales arrondies au supérieur
      const average = Math.round((sumGrades / grades.length) * 100) / 100;

      // On met à jour les propriétés ratings et averageRating du livre
      // return pour obtenir le résultat de l'update avant d'exécuter les autres promesses
      return Book.updateOne(
        { _id: bookId },
        { ratings: rates, averageRating: average, _id: bookId },
      ).catch((error) => res.status(400).json({ error }));
    })
    .then(
      () =>
        // eslint-disable-next-line implicit-arrow-linebreak
        Book.findOne({ _id: bookId }).then((updatedBook) => res.status(201).json(updatedBook)),
      // eslint-disable-next-line function-paren-newline
    )
    .catch((error) => {
      if (error.message === 'Request Error') {
        res.status(400).json({ error });
      } else {
        res.status(404).json({ error });
      }
    });
};

exports.getThreeBestBooks = (req, res) => {
  // Méthodes sort + limit de Mongoose : tri par moyenne décroissante + retourner 3 premiers livres
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((bestBooks) => res.status(200).json(bestBooks))
    .catch((error) => res.status(404).json({ error }));
};
