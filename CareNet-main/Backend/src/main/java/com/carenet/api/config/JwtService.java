package com.carenet.api.config;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Component
public class JwtService {
    private final byte[] secret;
    private final long ttlSeconds;

    public JwtService(AppJwtProperties props) {
        this.secret = props.getSecret().getBytes();
        this.ttlSeconds = props.getTtlSeconds();
    }

    public String create(Map<String, Object> claims) throws JOSEException {
        Instant now = Instant.now();
        JWTClaimsSet.Builder builder = new JWTClaimsSet.Builder()
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plusSeconds(ttlSeconds)));
        claims.forEach(builder::claim);
        SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), builder.build());
        jwt.sign(new MACSigner(secret));
        return jwt.serialize();
    }
}
