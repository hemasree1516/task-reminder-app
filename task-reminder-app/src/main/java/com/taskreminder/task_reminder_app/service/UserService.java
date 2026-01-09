package com.taskreminder.task_reminder_app.service;

import com.taskreminder.task_reminder_app.model.User;
import com.taskreminder.task_reminder_app.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public boolean exists(String email) {
        return repo.findByEmail(email).isPresent();
    }

    public void createUser(String email, String password) {
        User u = new User();
        u.setEmail(email);
        u.setPassword(encoder.encode(password));
        repo.save(u);
    }

    public boolean login(String email, String password) {
        return repo.findByEmail(email)
                .map(u -> encoder.matches(password, u.getPassword()))
                .orElse(false);
    }

    public void updatePassword(String email, String password) {
        User u = repo.findByEmail(email).orElseThrow();
        u.setPassword(encoder.encode(password));
        repo.save(u);
    }
}
