package com.webbd.backend.controller;

import com.webbd.backend.dto.AuthResponse;
import com.webbd.backend.dto.LoginRequest;
import com.webbd.backend.dto.RegisterRequest;
import com.webbd.backend.entity.ERole;
import com.webbd.backend.entity.Role;
import com.webbd.backend.entity.User;
import com.webbd.backend.repository.RoleRepository;
import com.webbd.backend.repository.UserRepository;
import com.webbd.backend.security.jwt.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (!StringUtils.hasText(email) || !StringUtils.hasText(request.getPassword()) || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email hợp lệ và mật khẩu tối thiểu 6 ký tự!"));
        }
        if (!StringUtils.hasText(request.getFullName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập họ và tên!"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email này đã được sử dụng!"));
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                request.getPhone(),
                request.getAddress()
        );

        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền ROLE_CUSTOMER trong CSDL!"));
        user.setRoles(Set.of(customerRole));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đăng ký tài khoản thành công!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (!StringUtils.hasText(email) || !StringUtils.hasText(request.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập email và mật khẩu!"));
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String canonicalEmail = authentication.getName();
            String jwt = jwtUtils.generateJwtToken(canonicalEmail);
            List<String> roles = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();

            return ResponseEntity.ok(new AuthResponse(jwt, canonicalEmail, roles));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Email hoặc mật khẩu không chính xác!"));
        }
    }
}
