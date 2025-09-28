package com.nhjasani.HowlEatsAPI.service;

import java.util.Collections;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.nhjasani.HowlEatsAPI.entity.UserEntity;
import com.nhjasani.HowlEatsAPI.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + email));

       return new User(user.getEmail(), user.getPassword(), Collections.emptyList());
    }


}
