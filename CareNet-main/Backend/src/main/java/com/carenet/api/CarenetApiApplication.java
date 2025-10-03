package com.carenet.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.carenet.api.config.AppJwtProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppJwtProperties.class)
public class CarenetApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(CarenetApiApplication.class, args);
    }
}
