package com.c3d1.backend.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthService authService;


    @PostMapping("/register")

    public LoginResponse register(

            @RequestBody
            RegisterRequest request

    ){

        return authService.register(request);

    }

    @PostMapping("/login")

    public LoginResponse login(

            @RequestBody
            LoginRequest request

    ){

        return authService.login(request);

    }

    @PostMapping("/google")
    public LoginResponse googleLogin(@RequestBody GoogleLoginRequest request) {
        return authService.loginWithGoogle(request);
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(
            @RequestBody
            RefreshRequest request
    ) {
        return authService.refresh(request.getRefreshToken());
    }

    @GetMapping("/me")
    public UserProfileResponse me(
            Authentication authentication
    ) {
        return authService.me(authentication.getName());
    }

    @PutMapping("/me")
    public UserProfileResponse updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {
        return authService.updateProfile(authentication.getName(), request);
    }

    @PutMapping("/me/password")
    public UserProfileResponse changePassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request
    ) {
        return authService.changePassword(authentication.getName(), request);
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponse forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public ResetPasswordResponse resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {
        return authService.resetPassword(request);
    }

}
