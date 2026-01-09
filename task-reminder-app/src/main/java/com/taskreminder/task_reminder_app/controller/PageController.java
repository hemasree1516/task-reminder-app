package com.taskreminder.task_reminder_app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String loginPage() {
        return "login.html";
    }

    @GetMapping("/dashboard")
    public String dashboardPage() {
        return "dashboard.html";
    }
}
