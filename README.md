# Mon vieux Grimoire


## Comment lancer le projet ? 

### Configurer les variables d'environnement

Il faut renseigner les identifiants de connection à la base de données MongoDB
et la clé secrète pour générer et vérifier les tokens

Renommez le fichier `.env.example` en `.env` et renseignez les valeurs suivantes :
- MONGODB_IDENTIFIERS=`api_tester:0VyyTb7hetMOnyL9`
- TOKEN_KEY=`RANDOM_TOKEN_SECRET`

### Lancer le projet avec npm

Faites la commande `npm install` pour installer les dépendances puis `npm start` pour lancer le projet. 

Le projet a été testé sur node 19. 