package com.hospital.ticket.config;

import com.hospital.ticket.model.SecurityCustomer;
import com.hospital.ticket.model.Specialist;
import com.hospital.ticket.repository.SpecialistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpecialistDetailsService implements UserDetailsService {
    @Autowired
    private SpecialistRepository specialistRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        List<Specialist> specialists = specialistRepository.findByTitle(username);
        if (specialists.size() == 0) {
            throw new UsernameNotFoundException("User details not found for the user : " + username);
        }
        return new SecurityCustomer(specialists.get(0));
    }
}
