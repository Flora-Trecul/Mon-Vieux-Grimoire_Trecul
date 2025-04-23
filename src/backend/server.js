// Package HTTP natif de Node pour créer un serveur
// require importe un module de base de Node (CommonJS) sans spécifier le chemin relatif
const http = require('http');
// On importe l'application Express et on définit le port utilisé
const app = require('./app');

// Fonction exécutée à chaque appel du serveur
const server = http.createServer(app);

// Renvoi d'un port valide
const normalisePort = (value) => {
  const port = parseInt(value, 10);
  if (Number.isNaN(port)) {
    return value;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// On définit notre port : celui la plateforme de déploiement ou par défaut localhost:4000
const port = normalisePort(process.env.PORT || 4000);
app.set('port', port);

// Gestion des erreurs de port
const errorHandler = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port: ${port}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges.`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use.`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};
server.on('error', errorHandler);

server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port: ${port}`;
  console.log(`Listening on ${bind}`);
});

server.listen(port);
