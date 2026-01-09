async function sendOtp() {
    const email = document.getElementById("email").value;

    const res = await fetch("/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email })
    });

    const text = await res.text();
    alert(text);
}

async function verifyOtp() {
    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;

    const res = await fetch("/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, otp })
    });

    const text = await res.text();

    if (text.includes("successful")) {
        window.location.href = "/dashboard.html"; // dashboard
    } else {
        alert(text);
    }
}
