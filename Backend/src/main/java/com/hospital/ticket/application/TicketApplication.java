package com.hospital.ticket.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScans;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@EnableAutoConfiguration
@EnableJpaRepositories("com.hospital.ticket.repository")
@EntityScan("com.hospital.ticket.model")
@ComponentScans({ @ComponentScan("com.hospital.ticket.controller"), @ComponentScan("com.hospital.ticket.config") })
@Configuration
@SpringBootApplication
public class TicketApplication {
	public static void main(String[] args) {
		SpringApplication.run(TicketApplication.class, args);
	}

}
