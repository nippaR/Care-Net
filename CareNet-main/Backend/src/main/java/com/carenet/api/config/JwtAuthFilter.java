// src/main/java/com/carenet/api/config/JwtAuthFilter.java
package com.carenet.api.config;

import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.crypto.MACVerifier;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;
import java.text.ParseException;
import java.util.*;
import java.util.stream.Collectors;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final byte[] secret;

    public JwtAuthFilter(AppJwtProperties props) {
        this.secret = props.getSecret().getBytes();
    }

    @Override
    protected void doFilterInternal(@SuppressWarnings("null") HttpServletRequest req, @SuppressWarnings("null") HttpServletResponse res, @SuppressWarnings("null") FilterChain chain)
            throws ServletException, IOException {

        String header = req.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                JWSObject jws = JWSObject.parse(token);
                if (jws.verify(new MACVerifier(secret))) {
                    Map<String, Object> claims = jws.getPayload().toJSONObject();

                    // subject -> user id
                    String uid = Objects.toString(claims.get("sub"), null);
                    if (uid != null) {
                        req.setAttribute("uid", uid);

                        // roles (optional) -> authorities
                        Collection<?> rawRoles = null;
                        Object rolesObj = claims.get("roles");
                        if (rolesObj instanceof Collection<?> c) rawRoles = c;

                        List<SimpleGrantedAuthority> auths = (rawRoles == null ? List.<String>of() :
                                rawRoles.stream().map(Object::toString).toList())
                                .stream()
                                .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toList());

                        // Build Authentication and set into SecurityContext
                        var authentication = new UsernamePasswordAuthenticationToken(uid, null, auths);
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (ParseException | com.nimbusds.jose.JOSEException ignore) {
                // Invalid token -> leave context unauthenticated; downstream will 401/403
            }
        }

        chain.doFilter(req, res);
    }
}
