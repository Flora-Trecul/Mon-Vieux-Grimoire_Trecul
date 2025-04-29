# Mon vieux Grimoire


## Comment lancer le projet ? 

### Configurer les variables d'environnement

Il faut renseigner les identifiants de connection à la base de données MongoDB
et la clé secrète pour générer et vérifier les tokens

Renommez le fichier `.env.example` en `.env` et renseignez les valeurs suivantes :
- MONGODB_IDENTIFIERS=`api_tester:0VyyTb7hetMOnyL9`
- TOKEN_KEY=`RANDOM_TOKEN_SECRET`

### Lancer le projet avec nodemon et npm

Utilisez les commandes `npm install` pour installer les dépendances puis `npm start` pour lancer le projet.

Utilisez la commande `nodemon server` à partir du dossier `src/backend` pour lancer la connexion à la base de données.

Le projet a été testé sur node 19. 