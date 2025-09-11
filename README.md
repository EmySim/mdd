MDD - Monde de Développeur
Réseau social pour développeurs permettant de partager des articles, de s'abonner à des thèmes techniques et d'échanger via des commentaires.

🚀 Installation
Cette section vous guide à travers les différentes étapes pour installer et lancer l'application MDD.

Prérequis
Assurez-vous que les logiciels suivants sont installés et configurés sur votre machine :

Java 11+ : Pour le backend Spring Boot.

Node.js 18+ et npm : Pour le frontend Angular.

MySQL 8.0+ : Pour la base de données.

Angular CLI : Installez-le globalement avec la commande npm install -g @angular/cli.

1. Cloner le projet
Ouvrez un terminal et clonez le repository du projet :

Bash

git clone https://github.com/votre-repo/mdd.git
cd mdd
2. Configuration et installation de la base de données
La base de données MySQL est essentielle pour le bon fonctionnement de l'application. Le script database-setup.sql est conçu pour créer la base de données, son schéma et les données initiales nécessaires.

Étape 1 : Création de la base de données
Connectez-vous à votre serveur MySQL en tant qu'utilisateur ayant les droits d'administration (par exemple, root) et créez la base de données mdd_db.

Bash

mysql -u root -p -e "CREATE DATABASE mdd_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Étape 2 : Exécution du script de création
Exécutez le script database-setup.sql pour créer toutes les tables et insérer les données de référence (sujets, utilisateurs de base, etc.). Assurez-vous d'être à la racine du projet (mdd/).

Bash

mysql -u root -p mdd_db < back/src/main/resources/db/database-setup.sql
Note : Le script de base de données est idempotent. Si vous le relancez, il supprimera les tables existantes et les recréera, ce qui peut être utile pour réinitialiser la base de données.

3. Configuration et lancement du backend
Le backend est développé avec Spring Boot.

Déplacez-vous dans le dossier du backend :

Bash

cd back
Créez un fichier .env à la racine de ce dossier avec les variables d'environnement pour la connexion à la base de données et la configuration JWT.

DB_USERNAME=mdd_app
DB_PASSWORD=Db@dm1n_MDD!2025#
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mdd_db
JWT_SECRET=MddSecretKeyForJWTTokenGeneration2024VerySecureAndLongEnoughForHS256AlgorithmProduction
Lancez l'application Spring Boot :

Bash

mvn spring-boot:run
Le backend démarrera sur http://localhost:8080.

4. Configuration et lancement du frontend
Le frontend est une application Angular.

Déplacez-vous dans le dossier du frontend :

Bash

cd front
Installez les dépendances npm :

Bash

npm install
Lancez le serveur de développement :

Bash

npm run start
Le frontend sera accessible sur http://localhost:4200.

5. Accéder à l'application
Une fois le backend et le frontend lancés, vous pouvez accéder à l'application :

Backend API : http://localhost:8080

Frontend : http://localhost:4200

💡 Utilisation
Créer un compte
Allez sur l'application : http://localhost:4200

Cliquez sur "S'inscrire".

Remplissez le formulaire d'inscription (nom, email, mot de passe).

Connectez-vous avec les identifiants créés.

Fonctionnalités principales
Créer un article

Connectez-vous à l'application.

Allez sur la page "Articles".

Cliquez sur "Créer un article".

Choisissez un thème, ajoutez un titre et le contenu de votre article.

Cliquez sur "Publier".

S'abonner à des thèmes

Allez sur la page "Thèmes".

Parcourez la liste des sujets disponibles (Java, Angular, React, etc.).

Cliquez sur "S'abonner" sur les thèmes qui vous intéressent.

Voir son fil personnalisé

Allez sur la page "Articles".

Les articles des thèmes auxquels vous êtes abonné s'affichent automatiquement, créant un fil d'actualité personnalisé.

Commenter un article

Cliquez sur un article pour le lire.

Utilisez le formulaire de commentaire en bas de la page.

Votre commentaire apparaîtra immédiatement après sa publication.

Gérer son profil

Cliquez sur l'icône de l'utilisateur dans la barre de navigation.

Vous pouvez modifier votre nom, votre email ou votre mot de passe.

Consultez également la liste de vos abonnements aux thèmes.

Frontend - Application Angular
Ce dossier contient la partie frontend de l'application, développée avec Angular.

Structure du dossier
src/ : Code source de l'application Angular

angular.json : Configuration Angular

package.json : Dépendances et scripts npm

Scripts utiles
npm run start : Lance le serveur de développement.

ng build : Compile l'application pour la production.

Contact
Pour toute question ou problème d'installation, n'hésitez pas à contacter l'équipe de développement.
