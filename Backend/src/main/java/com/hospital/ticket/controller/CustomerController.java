package com.hospital.ticket.controller;

import com.hospital.ticket.constants.SecretConstants;
import com.hospital.ticket.constants.SecurityConstants;
import com.hospital.ticket.model.Specialist;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.SecretKey;
import javax.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Date;
import java.util.List;

@RestController
public class CustomerController {

    @RequestMapping("/customerToken/{id}")
    public void generateCustomerJWTToken(@PathVariable("id") Long id, HttpServletResponse response) {
        SecretKey key = Keys.hmacShaKeyFor(SecretConstants.JWT_KEY.getBytes(StandardCharsets.UTF_8));
        String jwt = Jwts.builder().setIssuer("HTA").setSubject("JWT Token")
                .claim("username", id.toString())
                .claim("authorities", SecurityConstants.CUSTOMER)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + 3000000000L))
                .signWith(key).compact();
        response.setHeader(SecurityConstants.JWT_HEADER, jwt);
    }

}
