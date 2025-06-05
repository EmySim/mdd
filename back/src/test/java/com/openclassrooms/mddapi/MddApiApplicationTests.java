package com.openclassrooms.mddapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")  // Active le profil de test
class MddApiApplicationTests {
	@Test
	void contextLoads() {
		// Test que le contexte Spring se charge correctement
	}
}
