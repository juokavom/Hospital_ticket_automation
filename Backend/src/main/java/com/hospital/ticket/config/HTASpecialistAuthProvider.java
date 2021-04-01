package com.hospital.ticket.config;

import com.hospital.ticket.constants.SecurityConstants;
import com.hospital.ticket.filter.JWTTokenValidatorFilter;
import com.hospital.ticket.model.Specialist;
import com.hospital.ticket.repository.SpecialistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

@Component
public class HTASpecialistAuthProvider implements AuthenticationProvider {
    @Autowired
    private SpecialistRepository specialistRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) {
        String username = authentication.getName();
        String pwd = authentication.getCredentials().toString();
        List<Specialist> specialists = specialistRepository.findByTitle(username);
        if (specialists.size() > 0) {
            if (passwordEncoder.matches(pwd, specialists.get(0).getPassword())) {
                return new UsernamePasswordAuthenticationToken(specialists.get(0).getId(), pwd, null);
            } else {
                throw new BadCredentialsException("Invalid password!");
            }
        }else {
            throw new BadCredentialsException("No user registered with this details!");
        }
    }

    @Override
    public boolean supports(Class<?> authenticationType) {
        return authenticationType.equals(UsernamePasswordAuthenticationToken.class);
    }
}
