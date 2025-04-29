const { rateLimit } = require('express-rate-limit');

// Limiteur d'authentification : une IP est limitée à 100 requêtes par fenêtre / 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  // Activation des headers standards (infos sur le rate limit dans les headers)
  standardHeaders: true,
  // Désactivation des legacy headers (true par défaut pour raisons de compatibilité)
  legacyHeaders: false,
});

// Limiteur pour créer des livres : 20 requêtes / 10 minutes (à ajuster selon retours utilisateurs)
// Empêcher la surcharge sans décourager un utilisateur qui répertorie toute sa bibliothèque
const createBookLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: { error: 'Trop de livres créés, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour modifier un livre : 10 requêtes / 30 minutes (à ajuster)
const updateBookLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  limit: 10,
  message: { error: 'Trop de modifications, veuillez réessayer plus tard.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, createBookLimiter, updateBookLimiter };
