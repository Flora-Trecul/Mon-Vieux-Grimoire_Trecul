const multer = require('multer');

// On liste les MIME types possibles pour définir ensuite l'extension du fichier
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
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

const fileFilter = (req, file, cb) => {
  // On vérifie si le mimeType du fichier est bien l'une des clés de MIME_TYPES
  // Si oui, on traite le fichier, sinon on renvoie une erreur et on ne traite pas le fichier
  if (Object.keys(MIME_TYPES).includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(), false);
  }
};

// On exporte le module avec la méthode multer appliquée à storage et fileFilter
// + single pour préciser qu'on traite un unique fichier de type image
module.exports = multer({ storage, fileFilter }).single('image');
