function emailInput() {
    return document.getElementById("email").value;
}

/* ---------- SIGNUP OTP ---------- */
async function sendSignupOtp() {
    const email = emailInput();
    if (!email) return alert("Email required");

    const res = await fetch("/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email })
    });

    alert(await res.text());
}

/* ---------- FORGOT PASSWORD OTP ---------- */
async function sendForgotOtp() {
    const email = emailInput();
    if (!email) return alert("Email required");

    const res = await fetch("/auth/forgot-otp", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email })
    });

    alert(await res.text());
}

/* ---------- VERIFY OTP (SIGNUP) ---------- */
async function verifyOtp() {
    const email = emailInput();
    const otp = document.getElementById("otp").value;
    const password = document.getElementById("password").value;

    if (!email || !otp || !password) {
        return alert("All fields required");
    }

    const res = await fetch("/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, otp, password })
    });

    const msg = await res.text();
    alert(msg);

    if (msg.toLowerCase().includes("successful")) {
        location.href = "dashboard.html";
    }
}

/* ---------- LOGIN ---------- */
async function login() {
    const email = emailInput();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        return alert("Email and password required");
    }

    const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, password })
    });

    const msg = await res.text();
    alert(msg);

    if (msg.toLowerCase().includes("successful")) {
        location.href = "dashboard.html";
    }
}

/* ---------- RESET PASSWORD ---------- */
async function resetPassword() {
    const email = emailInput();
    const otp = document.getElementById("otp").value;
    const password = document.getElementById("password").value;

    if (!email || !otp || !password) {
        return alert("All fields required");
    }

    const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, otp, password })
    });

    alert(await res.text());
}
