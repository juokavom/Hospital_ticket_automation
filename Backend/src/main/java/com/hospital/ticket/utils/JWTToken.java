package com.hospital.ticket.utils;

import com.hospital.ticket.constants.SecretConstants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

public class JWTToken {
    public static Authentication validate(String jwt) {
        Authentication auth;
        try {
            SecretKey key = Keys.hmacShaKeyFor(
                    SecretConstants.JWT_KEY.getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(jwt)
                    .getBody();
            String username = String.valueOf(claims.get("username"));
            String authorities = (String) claims.get("authorities");
            auth = new UsernamePasswordAuthenticationToken(username, null,
                    AuthorityUtils.commaSeparatedStringToAuthorityList(authorities));
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid Token received!");
        }
        return auth;
    }
    public static String generate(String username, String authorities) {
        SecretKey key = Keys.hmacShaKeyFor(SecretConstants.JWT_KEY.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder().setIssuer("HTA").setSubject("JWT Token")
                .claim("username", username)
                .claim("authorities", authorities)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + 3000000000L))
                .signWith(key).compact();
    }
}
