package net.kanzanso.Kanzanso;

import net.kanzanso.Kanzanso.service.SpotifyService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(locations = "classpath:application.properties")
@EnableAutoConfiguration(exclude = {DataSourceAutoConfiguration.class})
class KanzansoApplicationTests {

	@MockBean
	private SpotifyService spotifyService;

	@Test
	void contextLoads() {
	}

}
