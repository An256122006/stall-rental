package org.example.stallrental.security.principal;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailService implements UserDetailsService {
    private final UserRepository userRepository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user=userRepository.findByUsername(username).orElseThrow(()->new UsernameNotFoundException("User not found with username: "+username));
        Collection<GrantedAuthority> grantedAuthorities= List.of(new SimpleGrantedAuthority(user.getRole().name()));
        return UserPrincipal.builder().user(user).authorities(grantedAuthorities).build();
    }
}
