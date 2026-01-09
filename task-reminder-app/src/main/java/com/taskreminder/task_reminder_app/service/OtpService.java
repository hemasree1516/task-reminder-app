package com.taskreminder.task_reminder_app.service;

import com.taskreminder.task_reminder_app.model.OtpVerification;
import com.taskreminder.task_reminder_app.repository.OtpRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    private final OtpRepository repo;

    public OtpService(OtpRepository repo) {
        this.repo = repo;
    }

    public void sendOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        OtpVerification v = repo.findByEmail(email).orElse(new OtpVerification());
        v.setEmail(email);
        v.setOtp(otp);
        v.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        v.setVerified(false);

        repo.save(v);

        System.out.println("OTP for " + email + " = " + otp);
    }

    public boolean verifyOtp(String email, String otp) {
        return repo.findByEmail(email)
                .filter(v -> !v.isVerified())
                .filter(v -> v.getOtp().equals(otp))
                .filter(v -> v.getExpiryTime().isAfter(LocalDateTime.now()))
                .map(v -> {
                    v.setVerified(true);
                    repo.save(v);
                    return true;
                })
                .orElse(false);
    }
}
