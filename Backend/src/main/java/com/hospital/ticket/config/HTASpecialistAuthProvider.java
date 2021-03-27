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

    private final Logger LOG =
            Logger.getLogger(HTASpecialistAuthProvider.class.getName());

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
                ArrayList<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority(SecurityConstants.SPECIALIST));
                LOG.info("Authenticated!!!!!!!!!!!!");
                return new UsernamePasswordAuthenticationToken(username, pwd, authorities);
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
