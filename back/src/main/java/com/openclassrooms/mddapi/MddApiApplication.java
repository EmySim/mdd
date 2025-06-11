package com.openclassrooms.mddapi;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principale de l'application MDD (Monde de Dév)
 *
 * Cette application implémente un réseau social destiné aux développeurs
 * avec une architecture sécurisée utilisant Spring Security et JWT.
 *
 * Architecture technique :
 * - Backend : Spring Boot + Spring Security + JWT
 * - Base de données : MySQL avec Spring Data JPA
 * - Frontend : Angular (séparé)
 * - Sécurité : Authentification stateless via tokens JWT
 *
 * @author OpenClassrooms MDD Team
 * @version 1.0
 * @since 1.0
 */
@SpringBootApplication
public class MddApiApplication {

	/**
	 * Point d'entrée principal de l'application
	 *
	 * Charge automatiquement les variables d'environnement depuis le fichier .env
	 * puis démarre l'application Spring Boot avec toutes ses configurations.
	 *
	 * @param args Arguments de ligne de commande
	 */
	public static void main(String[] args) {
		// Chargement automatique des variables d'environnement
		loadEnvironmentVariables();

		// Démarrage de l'application Spring Boot
		SpringApplication.run(MddApiApplication.class, args);
	}

	/**
	 * Charge les variables d'environnement depuis le fichier .env
	 *
	 * Cette méthode recherche un fichier .env dans le répertoire courant
	 * et applique toutes les variables qu'il contient comme propriétés système.
	 *
	 * Gestion des erreurs :
	 * - Si le fichier .env n'existe pas : continue avec les valeurs par défaut
	 * - Si le fichier est malformé : ignore les lignes incorrectes
	 * - Masque automatiquement les mots de passe dans les logs
	 */
	private static void loadEnvironmentVariables() {
		try {
			// Configuration du chargeur dotenv avec gestion d'erreurs
			Dotenv dotenv = Dotenv.configure()
					.directory("./")                    // Répertoire du fichier .env
					.ignoreIfMalformed()               // Ignore les erreurs de format
					.ignoreIfMissing()                 // Continue si le fichier n'existe pas
					.load();

			// Application des variables d'environnement au système
			dotenv.entries().forEach(entry -> {
				System.setProperty(entry.getKey(), entry.getValue());

				// Log sécurisé (masque les mots de passe)
				String value = entry.getKey().toLowerCase().contains("password")
						? "***"
						: entry.getValue();
				System.out.println("✅ Variable chargée: " + entry.getKey() + " = " + value);
			});

			System.out.println("🔐 Fichier .env chargé avec succès");
			System.out.println("🚀 Démarrage de l'application MDD API...");

		} catch (Exception e) {
			System.out.println("⚠️  Aucun fichier .env trouvé - utilisation des valeurs par défaut");
			System.out.println("💡 Astuce: Créez un fichier .env avec vos variables de configuration");
			System.out.println("📋 Variables attendues: DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME");
		}
	}
}