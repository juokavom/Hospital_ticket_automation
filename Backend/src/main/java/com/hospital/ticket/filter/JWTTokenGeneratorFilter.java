package com.hospital.ticket.filter;

import com.hospital.ticket.constants.EndpointConstants;
import com.hospital.ticket.constants.SecretConstants;
import com.hospital.ticket.constants.SecurityConstants;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Logger;

public class JWTTokenGeneratorFilter extends OncePerRequestFilter {
    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (null != authentication) {
            SecretKey key = Keys.hmacShaKeyFor(SecretConstants.JWT_KEY.getBytes(StandardCharsets.UTF_8));
            String jwt = Jwts.builder().setIssuer("HTA").setSubject("JWT Token")
                    .claim("username", authentication.getName())
                    .claim("authorities", SecurityConstants.SPECIALIST)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date((new Date()).getTime() + 3000000000L))
                    .signWith(key).compact();
            response.setHeader(SecurityConstants.JWT_HEADER, jwt);
        }
        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().equals(EndpointConstants.LOGIN);
    }
}
