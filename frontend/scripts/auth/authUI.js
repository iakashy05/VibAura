import { login, signup, isAuthenticated, getCurrentUser, logout } from '/scripts/auth/authService.js';
import { LibraryManager } from '/scripts/ui/libraryManager.js';

/**
 * Helper to render the common professional Auth layout (Split screen desktop, centered mobile).
 */
function renderAuthLayout(formHTML, title, subtitle) {
    const authRoot = document.getElementById("auth-root");
    if (!authRoot) return;

    authRoot.innerHTML = `
    <div class="auth-view">
        <div class="auth-split-layout">
            <!-- Left Side: Branding (Desktop Only) -->
            <div class="auth-brand-side">
                <div class="auth-brand-content">
                    <img src="images/music.webp" alt="VibAura" class="auth-brand-logo">
                    <h1 class="auth-brand-title">VibAura</h1>
                    <p class="auth-brand-tagline">Your music, your vibe, your way. Immerse yourself in the sound.</p>
                </div>
            </div>

            <!-- Right Side: Form Content -->
            <div class="auth-form-side">
                <div class="auth-card">
                    <!-- Mobile Logo (Visible on mobile only) -->
                    <div class="auth-brand-mobile">
                        <img src="images/music.webp" alt="VibAura">
                    </div>

                    <div class="auth-header">
                        <h1>${title}</h1>
                        <p>${subtitle}</p>
                    </div>

                    ${formHTML}
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Initializes the Auth UI.
 */
export function initAuthUI() {
    updateHeader();
}

/**
 * Updates the user profile section in the header.
 */
function updateHeader() {
    const userProfiles = document.querySelectorAll('.user-profile');
    if (isAuthenticated()) {
        const user = getCurrentUser();
        userProfiles.forEach(profile => {
            profile.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff" alt="User Avatar" style="cursor: pointer; border: 2px solid var(--auth-primary);" title="Click to Logout" />
        `;
            profile.addEventListener('click', () => {
                if (confirm("Are you sure you want to logout?")) {
                    logout();
                    initAuthUI();
                    window.location.hash = "#/login";
                }
            });
        });
    } else {
        userProfiles.forEach(profile => {
            profile.innerHTML = `
        <a href="#/login" class="auth-link" style="font-size: 0.9rem; font-weight: 600; padding: 0.5rem 1rem; border: 2px solid var(--auth-primary); border-radius: 20px; color: var(--auth-primary);">
          Login
        </a>
      `;
            const newEl = profile.cloneNode(true);
            profile.parentNode.replaceChild(newEl, profile);
        });
    }
}

/**
 * Toggles between App view and Auth view.
 */
export function setAuthMode(isAuth) {
    const appRoot = document.getElementById("app-root");
    const authRoot = document.getElementById("auth-root");
    const body = document.body;

    if (isAuth) {
        if (appRoot) appRoot.style.display = "none";
        if (authRoot) {
            authRoot.style.display = "block";
            body.classList.add("auth-mode");
            body.classList.remove("app-active");
        }
    } else {
        if (appRoot) appRoot.style.display = "block";
        if (authRoot) {
            authRoot.style.display = "none";
            authRoot.innerHTML = "";
            body.classList.remove("auth-mode");
            body.classList.add("app-active");
        }
    }
}

/**
 * Renders the Login page.
 */
export function renderLoginPage() {
    setAuthMode(true);
    const formHTML = `
    <form id="login-form">
        <div class="form-group">
            <label class="form-label">Email Address</label>
            <div class="input-container">
                <input type="email" id="email" class="auth-input" placeholder=" " required>
                <img src="images/icons/mail.png" alt="">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-container">
                <input type="password" id="password" class="auth-input" placeholder=" " required>
                <img src="images/icons/lock.png" alt="">
                <button type="button" class="toggle-password" id="toggle-password">
                    <img src="images/icons/eye.png" alt="Show">
                </button>
            </div>
        </div>
        <div style="text-align: right; margin-bottom: 1rem;">
            <a href="#/forgot-password" class="auth-link" style="font-size: 0.85rem;">Forgot Password?</a>
        </div>
        <button type="submit" class="btn-auth-submit">Sign In</button>
        <div class="auth-footer">
            New to VibAura? <a href="#/signup" class="auth-link">Create Account</a>
        </div>
    </form>
    `;

    renderAuthLayout(formHTML, "Welcome Back", "Login to continue your vibe");
    setupPasswordToggle();

    const form = document.getElementById("login-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const btn = form.querySelector(".btn-auth-submit");

        try {
            btn.disabled = true;
            btn.textContent = "Verifying...";
            await login(email, password);
            initAuthUI();
            
            // Refresh library sidebar immediately after login to sync state
            if (LibraryManager && typeof LibraryManager.renderLibrary === 'function') {
                LibraryManager.renderLibrary();
            }

            window.location.hash = "#";
        } catch (error) {
            btn.disabled = false;
            btn.textContent = "Sign In";
            const card = document.querySelector(".auth-card");
            card.classList.add("shake");
            setTimeout(() => card.classList.remove("shake"), 400);
            alert("Login failed: " + error.message);
        }
    });
}

/**
 * Renders the Signup page.
 */
export function renderSignupPage() {
    setAuthMode(true);
    const formHTML = `
    <form id="signup-form">
        <div class="form-group">
            <label class="form-label">Email Address</label>
            <div class="input-container">
                <input type="email" id="email" class="auth-input" placeholder=" " required>
                <img src="images/icons/mail.png" alt="">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-container">
                <input type="password" id="password" class="auth-input" placeholder=" " required>
                <img src="images/icons/lock.png" alt="">
                <button type="button" class="toggle-password" id="toggle-password" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; opacity: 0.5; z-index: 10;">
                    <img src="images/icons/eye.png" style="position: static; width: 18px;" alt="Show">
                </button>
            </div>
        </div>
        <button type="submit" class="btn-auth-submit">Create Account</button>
        <div class="auth-footer">
            Already have an account? <a href="#/login" class="auth-link">Sign In</a>
        </div>
    </form>
    `;

    renderAuthLayout(formHTML, "Join VibAura", "Start your musical journey today");
    setupPasswordToggle();

    const form = document.getElementById("signup-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const btn = form.querySelector(".btn-auth-submit");

        try {
            btn.disabled = true;
            btn.textContent = "Creating...";
            await signup(email, password);
            alert("Account created! Please login.");
            window.location.hash = "#/login";
        } catch (error) {
            btn.disabled = false;
            btn.textContent = "Create Account";
            alert("Signup failed: " + error.message);
        }
    });
}

/**
 * Renders the Forgot Password page.
 */
export function renderForgotPasswordPage() {
    setAuthMode(true);
    const formHTML = `
    <form id="forgot-form">
        <div class="form-group">
            <label class="form-label">Email Address</label>
            <div class="input-container">
                <input type="email" id="email" class="auth-input" placeholder=" " required>
                <img src="images/icons/mail.png" alt="">
            </div>
        </div>
        <button type="submit" class="btn-auth-submit">Send Reset Link</button>
        <div class="auth-footer">
            Remember your password? <a href="#/login" class="auth-link">Back to Sign In</a>
        </div>
    </form>
    `;

    renderAuthLayout(formHTML, "Forgot Password?", "We'll email you a secure link");

    const form = document.getElementById("forgot-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const btn = form.querySelector(".btn-auth-submit");
        const originalText = btn.textContent;

        btn.disabled = true;
        btn.textContent = "Sending...";

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            
            if (res.ok) {
                renderOTPVerificationPage(email);
            } else {
                alert(data.message || "Request failed");
            }
        } catch (error) {
            alert("Something went wrong. Please try again.");
            console.error(error);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}

/**
 * Renders the OTP Verification page.
 * Includes a premium 6-digit split input and a resend timer.
 */
export function renderOTPVerificationPage(email) {
    setAuthMode(true);
    const formHTML = `
    <form id="otp-form">
        <p style="text-align: center; color: var(--auth-text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
            Code sent to <b>${email}</b>.
        </p>
        <div class="otp-container">
            <input type="text" class="otp-box" maxlength="1" pattern="[0-9]" inputmode="numeric" required />
            <input type="text" class="otp-box" maxlength="1" pattern="[0-9]" inputmode="numeric" required />
            <input type="text" class="otp-box" maxlength="1" pattern="[0-9]" inputmode="numeric" required />
            <input type="text" class="otp-box" maxlength="1" pattern="[0-9]" inputmode="numeric" required />
            <input type="text" class="otp-box" maxlength="1" pattern="[0-9]" inputmode="numeric" required />
            <input type="text" class="otp-box" maxlength="1" pattern="[0-9]" inputmode="numeric" required />
        </div>
        
        <button type="submit" class="btn-auth-submit">Verify Code</button>

        <div class="resend-container">
            <button type="button" class="resend-btn" id="resend-btn" disabled>
                Resend Code <span id="resend-timer" class="timer-text">(60s)</span>
            </button>
        </div>
        
        <div class="auth-footer" style="margin-top: 1rem;">
            <a href="#/forgot-password" class="auth-link">Back to Email</a>
        </div>
    </form>
    `;

    renderAuthLayout(formHTML, "Enter Verification Code", "Check your email for the 6-digit code");

    const otpBoxes = document.querySelectorAll(".otp-box");
    const resendBtn = document.getElementById("resend-btn");
    const otpForm = document.getElementById("otp-form");

    // Start Resend Timer
    startResendTimer(60);

    // Auto-focus Logic
    otpBoxes.forEach((box, idx) => {
        box.addEventListener("input", (e) => {
            if (e.target.value.length === 1 && idx < otpBoxes.length - 1) {
                otpBoxes[idx + 1].focus();
            }
        });

        box.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !e.target.value && idx > 0) {
                otpBoxes[idx - 1].focus();
            }
        });
    });

    // Handle OTP Submit
    otpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const otpCode = Array.from(otpBoxes).map(box => box.value).join("");
        const btn = otpForm.querySelector(".btn-auth-submit");

        btn.disabled = true;
        btn.textContent = "Verifying...";

        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: otpCode }),
            });
            const data = await res.json();

            if (res.ok) {
                renderNewPasswordPage(email, data.resetToken);
            } else {
                alert(data.message || "Invalid Code");
                otpBoxes.forEach(box => box.value = "");
                otpBoxes[0].focus();
            }
        } catch (error) {
            alert("Connection error. Try again.");
        } finally {
            btn.disabled = false;
            btn.textContent = "Verify Code";
        }
    });

    // Handle Resend
    resendBtn.addEventListener("click", async () => {
        try {
            resendBtn.disabled = true;
            await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            startResendTimer(60);
            alert("New code sent!");
        } catch (error) {
            alert("Failed to resend.");
            resendBtn.disabled = false;
        }
    });
}

/**
 * Resend Code Timer Helper
 */
function startResendTimer(seconds) {
    const timerSpan = document.getElementById("resend-timer");
    const resendBtn = document.getElementById("resend-btn");
    let timeLeft = seconds;

    resendBtn.disabled = true;
    
    const interval = setInterval(() => {
        timeLeft--;
        if (timerSpan) timerSpan.textContent = `(${timeLeft}s)`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            if (timerSpan) timerSpan.textContent = "";
            resendBtn.disabled = false;
        }
    }, 1000);
}

/**
 * Renders the Final New Password page.
 */
export function renderNewPasswordPage(email, resetToken) {
    setAuthMode(true);
    const formHTML = `
    <form id="new-password-form">
        <div class="form-group">
            <label class="form-label">Create New Password</label>
            <div class="input-container">
                <input type="password" id="password" class="auth-input" placeholder=" " required />
                <img src="images/icons/lock.png" alt="" />
                <button type="button" class="toggle-password" id="toggle-password">
                    <img src="images/icons/eye.png" alt="Show" />
                </button>
            </div>
        </div>
        <button type="submit" class="btn-auth-submit">Update Password</button>
    </form>
    `;

    renderAuthLayout(formHTML, "Security Update", "Please set your new secure password");
    setupPasswordToggle();

    const form = document.getElementById("new-password-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById("password").value;
        const btn = form.querySelector(".btn-auth-submit");

        btn.disabled = true;
        btn.textContent = "Saving...";

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: resetToken, newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                renderAuthLayout(`
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <img src="images/icons/check.png" alt="Success" style="width: 60px; margin-bottom: 1rem;" />
                        <p style="color: var(--auth-text-muted);">Your password has been changed successfully.</p>
                    </div>
                    <a href="#/login" class="btn-auth-submit" style="display: block; text-decoration: none; text-align: center;">Go to Login</a>
                `, "All Set!", "Password updated successfully");
            } else {
                alert(data.message || "Failed to update password");
            }
        } catch (error) {
            alert("Error updating password.");
        } finally {
            btn.disabled = false;
            btn.textContent = "Update Password";
        }
    });
}

/**
 * Helper to setup password visibility toggle.
 */
function setupPasswordToggle() {
    const toggleBtn = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("password");
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            toggleBtn.querySelector("img").src = type === "password"
                ? "images/icons/eye.png"
                : "images/icons/eye-off.png";
        });
    }
}
