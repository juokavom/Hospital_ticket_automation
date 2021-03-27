package com.hospital.ticket.model;

import com.hospital.ticket.constants.SecurityConstants;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class SecurityCustomer implements UserDetails {

    private static final long serialVersionUID = -6690946490872875352L;

    private final Specialist specialist;

    public SecurityCustomer(Specialist specialist) {
        this.specialist = specialist;
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(SecurityConstants.SPECIALIST));
        return authorities;
    }

    @Override
    public String getPassword() {
        return specialist.getPassword();
    }

    @Override
    public String getUsername() {
        return specialist.getTitle();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
