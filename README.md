# 🌐 MDD - Monde de Développeur

**Réseau social pour développeurs** permettant de partager des articles, de s'abonner à des thèmes techniques et d'échanger via des commentaires.

---

## 🚀 Installation

Cette section vous guide à travers les différentes étapes pour **installer et lancer l'application MDD**.

### Prérequis

Assurez-vous que les logiciels suivants sont installés sur votre machine :

* **Java 11+** : Pour le backend Spring Boot
* **Node.js 18+** et **npm** : Pour le frontend Angular
* **MySQL 8.0+** : Pour la base de données
* **Angular CLI** : Installez-le globalement avec :

```bash
npm install -g @angular/cli
```

---

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/mdd.git
cd mdd
```

---

### 2. Configuration et installation de la base de données

La base de données MySQL est essentielle au fonctionnement de l'application.

#### Étape 1 : Création de la base de données

```bash
mysql -u root -p -e "CREATE DATABASE mdd_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### Étape 2 : Exécution du script de création

Assurez-vous d'être à la racine du projet (`mdd/`) et lancez :

```bash
mysql -u root -p mdd_db < back/src/main/resources/db/database-setup.sql
```

> ⚠️ Le script est **idempotent** : si vous le relancez, il recréera les tables existantes, utile pour réinitialiser la base.

---

### 3. Configuration et lancement du backend

Le backend est développé avec **Spring Boot**.

1. Déplacez-vous dans le dossier du backend :

```bash
cd back
```

2. Créez un fichier `.env` à la racine du backend avec les variables suivantes :

Voir fichier

3. Lancez l'application :

```bash
mvn spring-boot:run
```

Le backend sera accessible sur : `http://localhost:8080`

---

### 4. Configuration et lancement du frontend

Le frontend est développé avec **Angular**.

1. Déplacez-vous dans le dossier frontend :

```bash
cd front
```

2. Installez les dépendances :

```bash
npm install
```

3. Lancez le serveur de développement :

```bash
npm run start
```

Le frontend sera accessible sur : `http://localhost:4200`

---

### 5. Accéder à l'application

* **Backend API** : [http://localhost:8080](http://localhost:8080)
* **Frontend** : [http://localhost:4200](http://localhost:4200)

---

## 💡 Utilisation

### Créer un compte

1. Allez sur [http://localhost:4200](http://localhost:4200)
2. Cliquez sur **S'inscrire**
3. Remplissez le formulaire (nom, email, mot de passe)
4. Connectez-vous avec vos identifiants

---

### Fonctionnalités principales

#### Créer un article

1. Connectez-vous à l'application
2. Allez sur la page **Articles**
3. Cliquez sur **Créer un article**
4. Choisissez un thème, ajoutez un titre et le contenu
5. Cliquez sur **Publier**

#### S'abonner à des thèmes

1. Allez sur la page **Thèmes**
2. Parcourez la liste (Java, Angular, React…)
3. Cliquez sur **S'abonner** aux thèmes souhaités

#### Voir son fil personnalisé

* Les articles des thèmes abonnés s’affichent automatiquement sur la page **Articles**

#### Commenter un article

1. Cliquez sur un article
2. Utilisez le formulaire de commentaire
3. Votre commentaire apparaîtra immédiatement

#### Gérer son profil

* Cliquez sur l'icône utilisateur dans la barre de navigation
* Modifiez nom, email, mot de passe
* Consultez vos abonnements aux thèmes

---

## 🖥 Frontend - Application Angular

### Structure du dossier

* `src/` : Code source Angular
* `angular.json` : Configuration Angular
* `package.json` : Dépendances et scripts npm

### Scripts utiles

* `npm run start` : Lance le serveur de développement
* `ng build` : Compile l'application pour la production

---

## 📫 Contact

Pour toute question ou problème, contactez l'équipe de développement.
