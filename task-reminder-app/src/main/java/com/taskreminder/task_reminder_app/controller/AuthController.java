package com.taskreminder.task_reminder_app.controller;

import com.taskreminder.task_reminder_app.service.OtpService;
import com.taskreminder.task_reminder_app.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final OtpService otpService;
    private final UserService userService;

    public AuthController(OtpService otpService, UserService userService) {
        this.otpService = otpService;
        this.userService = userService;
    }

    @PostMapping("/send-otp")
    public String sendOtp(@RequestParam String email) {
        otpService.sendOtp(email);
        return "OTP sent";
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam String email,
                            @RequestParam String otp,
                            @RequestParam String password) {

        if (!otpService.verifyOtp(email, otp)) {
            return "Invalid OTP";
        }

        if (!userService.exists(email)) {
            userService.createUser(email, password);
            return "Signup successful";
        }

        return "OTP verified";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password) {

        return userService.login(email, password)
                ? "Login successful"
                : "Invalid credentials";
    }

    @PostMapping("/forgot-otp")
    public String forgotOtp(@RequestParam String email) {

        if (!userService.exists(email)) {
            return "Email not registered";
        }

        otpService.sendOtp(email);
        return "OTP sent for password reset";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String email,
                                @RequestParam String otp,
                                @RequestParam String password) {

        if (!otpService.verifyOtp(email, otp)) {
            return "Invalid OTP";
        }

        userService.updatePassword(email, password);
        return "Password reset successful";
    }
}
