package com.taskreminder.task_reminder_app.util;

public class OtpUtil {

    public static String generateOtp() {
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }
}
