const multer = require('multer');

// On liste les MIME types possibles pour définir ensuite l'extension du fichier
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

// Middleware pour stocker les images de livres importées dans le formulaire d'ajout
const storage = multer.diskStorage({
  // On définit l'emplacement de stockage des images : le dossier 'images'
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // On définit le nouveau nom de fichier pour éviter d'avoir deux fichiers de même nom
  filename: (req, file, callback) => {
    // Nom d'origine en remplaçant les éventuels whitespace par des undescore _
    // split renvoie un tableau de valeurs basé sur le séparateur ' ' (espace)
    // join regroupe le tableau en une string, avec un underscore _ entre les différentes valeurs
    const name = file.originalname.split(' ').join('_').split('.')[0];
    const ext = MIME_TYPES[file.mimetype];
    // Nom final : name + .ext avec un timeStamp pour être sûr que le nom est unique
    callback(null, `${name}-${Date.now()}.${ext}`);
  },
});

// On exporte le module avec la méthode multer appliquée à l'objet storage
// + single pour préciser qu'on traite un unique fichier de type image
module.exports = multer({ storage }).single('image');
