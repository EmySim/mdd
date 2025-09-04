# MDD - Monde de Développeur

Réseau social pour développeurs permettant de partager des articles, de s'abonner à des thèmes techniques et d'échanger via des commentaires.

## Installation

### Prérequis
- Java 11+
- Node.js 18+ et npm
- MySQL 8.0+
- Angular CLI (`npm install -g @angular/cli`)

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone https://github.com/votre-repo/mdd.git
cd mdd
```

2. **Base de données**
```bash
# Créer la base MySQL
CREATE DATABASE mdd_db;

# Exécuter le script de création
mysql -u root -p mdd_db < back/src/main/resources/db/database-setup.sql
```

3. **Configuration Backend**
```bash
cd back

# Créer le fichier .env avec :
DB_USERNAME=mdd_app
DB_PASSWORD=Db@dm1n_MDD!2025#
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mdd_db
JWT_SECRET=MddSecretKeyForJWTTokenGeneration2024VerySecureAndLongEnoughForHS256AlgorithmProduction

# Lancer le backend
mvn spring-boot:run
```

4. **Configuration Frontend**
```bash
cd front

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run start
```

5. **Accéder à l'application**
- Backend API : http://localhost:8080
- Frontend : http://localhost:4200

## Utilisation

### Créer un compte
1. Aller sur l'application : http://localhost:4200
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire d'inscription (nom, email, mot de passe)
4. Se connecter avec les identifiants créés

### Fonctionnalités principales

**Créer un article**
1. Se connecter
2. Aller sur "Articles"  
3. Cliquer "Créer un article"
4. Choisir un thème, ajouter titre et contenu
5. Publier

**S'abonner à des thèmes**
1. Aller sur "Thèmes"
2. Parcourir la liste (Java, Angular, React, etc.)
3. Cliquer "S'abonner" sur les thèmes qui vous intéressent

**Voir son fil personnalisé**
1. Aller sur "Articles"
2. Les articles des thèmes suivis s'affichent automatiquement

**Commenter un article**
1. Cliquer sur un article pour le lire
2. Utiliser le formulaire de commentaire en bas
3. Votre commentaire apparaît immédiatement

**Gérer son profil**
1. Cliquer sur l'icône utilisateur
2. Modifier nom, email ou mot de passe
3. Voir la liste de ses abonnements

---

# Frontend - Application Angular

Ce dossier contient la partie frontend de l'application, développée avec Angular.

## Prérequis

- Node.js (version recommandée : 18.x ou supérieure)
- npm (version recommandée : 9.x ou supérieure)
- Angular CLI (`npm install -g @angular/cli`)

## Installation

```bash
npm install
```

## Lancement du serveur de développement

```bash
npm run start
```

L'application sera accessible sur [http://localhost:4200](http://localhost:4200).

## Structure du dossier

- `src/` : Code source de l'application Angular
- `angular.json` : Configuration Angular
- `package.json` : Dépendances et scripts npm

## Scripts utiles

- `npm run start` : Lance le serveur de développement
- `ng build` : Compile l'application pour la production

## Création de comptes utilisateurs

Les utilisateurs peuvent créer leurs comptes manuellement via l'application :
1. Aller sur l'application : [http://localhost:4200](http://localhost:4200)
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire d'inscription
4. Le compte est créé et l'utilisateur est automatiquement connecté

## Contact

Pour toute question, contactez l'équipe de développement.
