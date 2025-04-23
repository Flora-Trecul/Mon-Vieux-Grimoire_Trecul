const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Le header est sous la forme "Bearer token", on récupère la partie token
    const token = req.headers.authorization.split(' ')[1];
    // verify pour vérifier la validité du token + on extrait l'userId encodé
    const { userId } = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    // On ajoute "userId: userId" à la propriété auth de l'objet req pour le réutiliser
    req.auth = { userId };
    next();
  } catch (error) {
    res.status(403).json({ error });
  }
};
