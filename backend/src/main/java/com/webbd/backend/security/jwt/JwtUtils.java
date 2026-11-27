package com.webbd.backend.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    // Cache Key va Parser 1 lan luc khoi dong thay vi tao lai o moi HTTP request
    private SecretKey signingKey;
    private JwtParser jwtParser;

    @PostConstruct
    void init() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("jwt.secret phai co it nhat 32 bytes (256 bits) cho HS256");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.jwtParser = Jwts.parserBuilder().setSigningKey(this.signingKey).build();
    }

    public String generateJwtToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Xac thuc va trich xuat email chi trong 1 lan parse duy nhat (tiet kiem CPU o Filter).
     * Tra ve null neu token het han, sai chu ky hoac khong hop le.
     */
    public String extractEmailIfValid(String authToken) {
        try {
            return jwtParser.parseClaimsJws(authToken).getBody().getSubject();
        } catch (SecurityException | MalformedJwtException e) {
            logger.warn("Chu ky JWT khong hop le: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.warn("Token JWT da het han: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.warn("Dinh dang JWT khong duoc ho tro: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.warn("Chuoi JWT rong: {}", e.getMessage());
        }
        return null;
    }

    public String getEmailFromJwtToken(String token) {
        return jwtParser.parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        return extractEmailIfValid(authToken) != null;
    }
}
