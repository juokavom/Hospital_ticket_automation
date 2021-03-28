package com.hospital.ticket.filter;

import com.hospital.ticket.constants.EndpointConstants;
import com.hospital.ticket.constants.SecretConstants;
import com.hospital.ticket.constants.SecurityConstants;
import com.hospital.ticket.utils.JWTToken;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.apache.juli.logging.Log;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

public class JWTTokenValidatorFilter extends OncePerRequestFilter {

    @Override
    public void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String jwt = request.getHeader(SecurityConstants.JWT_HEADER);
        if (null != jwt) {
                SecurityContextHolder.getContext().setAuthentication(JWTToken.validate(jwt));
        }
        chain.doFilter(request, response);
    }


    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getServletPath().equals(EndpointConstants.LOGIN); }
}
