package org.example.stallrental.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.model.enumType.Role;
import org.example.stallrental.repository.UserRepository;
import org.example.stallrental.security.jwt.JwtUtil;
import org.example.stallrental.security.principal.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.cors.allowed-origins}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = oauthToken.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        User user = userRepository.findByUsername(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(email);
            newUser.setEmail(email);
            newUser.setFullName(name);
            newUser.setRole(Role.ROLE_CUSTOMER);
            newUser.setStatus(true);
            newUser.setCreatedAt(LocalDateTime.now());
            return userRepository.save(newUser);
        });

        UserPrincipal principal = UserPrincipal.builder()
                .user(user)
                .authorities(List.of(new SimpleGrantedAuthority(user.getRole().name())))
                .build();

        String accessToken = jwtUtil.generateAccessToken(principal);
        String refreshToken = jwtUtil.generateRefreshToken(principal);

        String redirectUrl = String.format(
                "%s/login?accessToken=%s&refreshToken=%s&username=%s&fullName=%s&email=%s&role=%s",
                frontendUrl,
                java.net.URLEncoder.encode(accessToken, java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(refreshToken, java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(user.getUsername(), java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(user.getFullName() != null ? user.getFullName() : "", java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(user.getEmail() != null ? user.getEmail() : "", java.nio.charset.StandardCharsets.UTF_8),
                java.net.URLEncoder.encode(user.getRole().name(), java.nio.charset.StandardCharsets.UTF_8)
        );

        log.info("OAuth2 login successful for user: {}", user.getUsername());
        response.sendRedirect(redirectUrl);
    }
}
