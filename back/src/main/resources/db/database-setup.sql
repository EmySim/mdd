-- ============================================================================
-- SCRIPT SQL POUR LA BASE DE DONNÉES MDD (Monde de Développeur)
-- Base de données MySQL
-- ============================================================================

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS mdd_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE mdd_db;

-- Supprimer les tables existantes (dans l'ordre inverse des dépendances)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- TABLE USERS
-- ============================================================================
CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Contraintes
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_username (username),

    -- Index pour les performances
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE SUBJECTS
-- ============================================================================
CREATE TABLE subjects (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    PRIMARY KEY (id),
    UNIQUE KEY uk_subjects_name (name),

    -- Index pour les performances
    INDEX idx_subjects_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE ARTICLES
-- ============================================================================
CREATE TABLE articles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    author_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,

    -- Contraintes
    PRIMARY KEY (id),

    -- Clés étrangères
    CONSTRAINT fk_articles_author
        FOREIGN KEY (author_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_articles_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Index pour les performances
    INDEX idx_articles_author_id (author_id),
    INDEX idx_articles_subject_id (subject_id),
    INDEX idx_articles_created_at (created_at DESC),
    INDEX idx_articles_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================
CREATE TABLE comments (
    id BIGINT NOT NULL AUTO_INCREMENT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    author_id BIGINT NOT NULL,
    article_id BIGINT NOT NULL,

    -- Contraintes
    PRIMARY KEY (id),

    -- Clés étrangères
    CONSTRAINT fk_comments_author
        FOREIGN KEY (author_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comments_article
        FOREIGN KEY (article_id) REFERENCES articles(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Index pour les performances
    INDEX idx_comments_author_id (author_id),
    INDEX idx_comments_article_id (article_id),
    INDEX idx_comments_created_at (created_at ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE subscriptions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    PRIMARY KEY (id),
    UNIQUE KEY uk_subscriptions_user_subject (user_id, subject_id),

    -- Clés étrangères
    CONSTRAINT fk_subscriptions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_subscriptions_subject
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Index pour les performances
    INDEX idx_subscriptions_user_id (user_id),
    INDEX idx_subscriptions_subject_id (subject_id),
    INDEX idx_subscriptions_subscribed_at (subscribed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DONNÉES MAÎTRES - SUJETS
-- ============================================================================

/**
 * Insertion des données de référence pour les sujets
 * Ces données sont stables et communes à l'application
 */
INSERT INTO subjects (name, description) VALUES
('Java', 'Langage de programmation orienté objet, plateforme de développement complète pour applications d''entreprise et mobiles.'),
('Spring Framework', 'Framework de développement Java pour créer des applications robustes avec l''inversion de contrôle et la programmation orientée aspect.'),
('JavaScript', 'Langage de script dynamique pour le développement web front-end et back-end, essentiel pour l''interactivité des pages web.'),
('React', 'Bibliothèque JavaScript pour construire des interfaces utilisateur interactives et des applications web modernes.'),
('Angular', 'Framework TypeScript pour développer des applications web dynamiques avec une architecture basée sur les composants.'),
('Node.js', 'Environnement d''exécution JavaScript côté serveur, permettant de créer des applications web rapides et scalables.'),
('Python', 'Langage de programmation polyvalent, idéal pour le développement web, l''analyse de données et l''intelligence artificielle.'),
('DevOps', 'Méthodologie combinant développement et opérations pour améliorer la collaboration et accélérer le déploiement d''applications.'),
('Base de données', 'Systèmes de gestion de données relationnelles et NoSQL, optimisation des requêtes et conception de schémas.'),
('Sécurité informatique', 'Pratiques et technologies pour protéger les applications, données et infrastructures contre les cybermenaces.'),
('Architecture logicielle', 'Conception et organisation des systèmes complexes, patterns architecturaux et bonnes pratiques de développement.'),
('Tests unitaires', 'Méthodologies et outils pour tester automatiquement le code, assurer la qualité et faciliter la maintenance.'),
('Docker', 'Plateforme de conteneurisation pour empaqueter, distribuer et exécuter des applications de manière portable.'),
('Git', 'Système de contrôle de version distribué pour suivre les modifications du code et collaborer efficacement en équipe.'),
('Microservices', 'Architecture distribuée décomposant les applications en services indépendants et faiblement couplés.');

-- ============================================================================
-- DONNÉES MAÎTRES - UTILISATEURS DE BASE
-- ============================================================================

/**
 * Insertion des utilisateurs de base pour le démarrage de l'application
 * Mots de passe hashés avec BCrypt (strength 10)
 */
INSERT INTO users (email, username, password) VALUES
('admin@mdd.com', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('author@mdd.com', 'author', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Uo0v.4GVDYlHcvklJcM9LxrJPz/1Hi'),
('user@mdd.com', 'user', '$2b$12$YZePMILFOezjsJVkenuAJ.5WBRt5DJwWvM///gKZzfoyN3GO0.uu.');

-- ============================================================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ============================================================================

SELECT 'Vérification des données maîtres :' AS message;

SELECT 'Sujets créés :' AS type, COUNT(*) as nombre FROM subjects;
SELECT 'Utilisateurs créés :' AS type, COUNT(*) as nombre FROM users;

-- Affichage des sujets insérés
SELECT id, name FROM subjects ORDER BY name;

-- Affichage des utilisateurs créés
SELECT id, username, email FROM users ORDER BY username;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

SELECT 'Base de données MDD créée avec succès avec les données maîtres !' AS message;