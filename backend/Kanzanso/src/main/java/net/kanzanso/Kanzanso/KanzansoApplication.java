package net.kanzanso.Kanzanso;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class, HibernateJpaAutoConfiguration.class})
@EnableMongoAuditing
@EnableWebMvc
public class KanzansoApplication {

	public static void main(String[] args) {
		SpringApplication.run(KanzansoApplication.class, args);
		System.out.println("Kanzanso application started successfully!");
		System.out.println("API available at http://localhost:8080/api");
	}

}
