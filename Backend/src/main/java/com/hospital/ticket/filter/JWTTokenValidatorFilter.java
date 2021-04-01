package com.hospital.ticket.filter;

import com.hospital.ticket.constants.SecurityConstants;
import com.hospital.ticket.utils.JWTToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

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
        return request.getServletPath().equals("/login"); }
}
