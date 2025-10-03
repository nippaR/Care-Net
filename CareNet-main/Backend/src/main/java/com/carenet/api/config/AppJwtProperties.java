package com.carenet.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.jwt")
public class AppJwtProperties {
    private String secret;
    private long ttlSeconds;

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
    public long getTtlSeconds() { return ttlSeconds; }
    public void setTtlSeconds(long ttlSeconds) { this.ttlSeconds = ttlSeconds; }
}
