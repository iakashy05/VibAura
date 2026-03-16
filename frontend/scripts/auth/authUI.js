import { login, signup, isAuthenticated, getCurrentUser, logout } from './authService.js';
import { LibraryManager } from '../ui/libraryManager.js';

/**
 * Initializes the Auth UI, mostly updating the header based on auth state.
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
            <img src="https://ui-avatars.com/api/?name=${user.email}&background=2563EB&color=fff" alt="User Avatar" style="cursor: pointer;" title="Click to Logout" />
        `;
            profile.addEventListener('click', () => {
                if (confirm("Are you sure you want to logout?")) {
                    logout();
                    initAuthUI();
                    if (LibraryManager && typeof LibraryManager.renderLibrary === 'function') {
                        LibraryManager.renderLibrary();
                    }
                    window.location.hash = "#/login";
                }
            });
        });
    } else {
        userProfiles.forEach(profile => {
            profile.innerHTML = `
        <a href="#/login" style="text-decoration: none; color: inherit; font-size: 0.9rem; font-weight: 600; padding: 0.5rem 1rem; border: 1px solid currentColor; border-radius: 20px;">
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

    if (isAuth) {
        if (appRoot) appRoot.style.display = "none";
        if (authRoot) {
            authRoot.style.display = "block";
            document.body.classList.add("auth-mode");
        }
    } else {
        if (appRoot) appRoot.style.display = "block";
        if (authRoot) {
            authRoot.style.display = "none";
            authRoot.innerHTML = ""; 
            document.body.classList.remove("auth-mode");
        }
    }
}

/**
 * Renders the Login page.
 */
export function renderLoginPage() {
    setAuthMode(true);
    const contentArea = document.getElementById("auth-root");
    if (!contentArea) return;

    contentArea.innerHTML = `
    <div class="auth-view">
      <div class="auth-wrapper">
        <div class="auth-container fade-in">
          <img src="images/music.webp" alt="VibAura" class="auth-logo">
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Login to continue your vibe</p>
          <form id="login-form">
            <div class="input-group">
              <label class="form-label">Email</label>
              <div class="input-wrapper">
                <img src="images/icons/mail.png" class="input-icon-left" alt="">
                <input type="email" id="email" class="form-input" placeholder="hello@example.com" required>
              </div>
            </div>
            <div class="input-group" style="margin-top: 1rem;">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <img src="images/icons/lock.png" class="input-icon-left" alt="">
                <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                <button type="button" class="toggle-password" id="toggle-password">
                  <img src="images/icons/eye.png" class="eye-icon" alt="Show">
                </button>
              </div>
            </div>
            <div style="text-align: right; margin-top: 0.5rem;">
              <a href="#/forgot-password" class="auth-link" style="font-size: 0.9rem;">Forgot Password?</a>
            </div>
            <button type="submit" class="btn-submit">Login</button>
            <div class="auth-footer">
              Don't have an account? <a href="#/signup" class="auth-link">Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
    `;

    setupPasswordToggle();

    const form = document.getElementById("login-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            await login(email, password);
            initAuthUI();
            if (LibraryManager && typeof LibraryManager.renderLibrary === 'function') {
                LibraryManager.renderLibrary();
            }
            window.location.hash = "#";
        } catch (error) {
            alert("Login failed: " + error.message);
        }
    });
}

/**
 * Renders the Signup page.
 */
export function renderSignupPage() {
    setAuthMode(true);
    const contentArea = document.getElementById("auth-root");
    if (!contentArea) return;

    contentArea.innerHTML = `
    <div class="auth-view">
      <div class="auth-wrapper">
        <div class="auth-container fade-in">
          <img src="images/music.webp" alt="VibAura" class="auth-logo">
          <h1 class="auth-title">Join VibAura</h1>
          <p class="auth-subtitle">Create an account to start listening</p>
          <form id="signup-form">
            <div class="input-group">
              <label class="form-label">Email</label>
              <div class="input-wrapper">
                <img src="images/icons/mail.png" class="input-icon-left" alt="">
                <input type="email" id="email" class="form-input" placeholder="hello@example.com" required>
              </div>
            </div>
            <div class="input-group" style="margin-top: 1rem;">
              <label class="form-label">Password</label>
              <div class="input-wrapper">
                <img src="images/icons/lock.png" class="input-icon-left" alt="">
                <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                <button type="button" class="toggle-password" id="toggle-password">
                  <img src="images/icons/eye.png" class="eye-icon" alt="Show">
                </button>
              </div>
            </div>
            <button type="submit" class="btn-submit">Sign Up</button>
            <div class="auth-footer">
              Already have an account? <a href="#/login" class="auth-link">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
    `;

    setupPasswordToggle();

    const form = document.getElementById("signup-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            await signup(email, password);
            alert("Account created! Please login.");
            window.location.hash = "#/login";
        } catch (error) {
            alert("Signup failed: " + error.message);
        }
    });
}

/**
 * Renders the Forgot Password page.
 */
export function renderForgotPasswordPage() {
    setAuthMode(true);
    const contentArea = document.getElementById("auth-root");
    if (!contentArea) return;

    contentArea.innerHTML = `
    <div class="auth-view">
      <div class="auth-wrapper">
        <div class="auth-container fade-in">
          <img src="images/music.webp" alt="VibAura" class="auth-logo">
          <h1 class="auth-title">Forgot Password</h1>
          <p class="auth-subtitle">Enter your email to receive a reset link</p>
          <form id="forgot-form">
            <div class="input-group">
              <label class="form-label">Email</label>
              <div class="input-wrapper">
                <img src="images/icons/mail.png" class="input-icon-left" alt="">
                <input type="email" id="email" class="form-input" placeholder="hello@example.com" required>
              </div>
            </div>
            <button type="submit" class="btn-submit">Send Reset Link</button>
            <div class="auth-footer">
              <a href="#/login" class="auth-link">Back to Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
    `;

    const form = document.getElementById("forgot-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const btn = form.querySelector(".btn-submit");
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
            alert(data.message);
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
 * Renders the Reset Password page.
 */
export function renderResetPasswordPage() {
    setAuthMode(true);
    const contentArea = document.getElementById("auth-root");
    if (!contentArea) return;

    const hash = window.location.hash;
    const parts = hash.split('?');
    const params = new URLSearchParams(parts[1] || "");
    const token = params.get("token");

    if (!token) {
        contentArea.innerHTML = `
      <div class="auth-view"><div class="auth-wrapper"><div class="auth-container">
        <h1 class="auth-title">Invalid Link</h1>
        <p class="auth-subtitle">Missing reset token.</p>
        <a href="#/login" class="auth-link">Back to Login</a>
      </div></div></div>`;
        return;
    }

    contentArea.innerHTML = `
    <div class="auth-view">
      <div class="auth-wrapper">
        <div class="auth-container fade-in">
          <img src="images/music.webp" alt="VibAura" class="auth-logo">
          <h1 class="auth-title">Reset Password</h1>
          <p class="auth-subtitle">Enter your new password below</p>
          <form id="reset-form">
            <div class="input-group">
              <label class="form-label">New Password</label>
              <div class="input-wrapper">
                <img src="images/icons/lock.png" class="input-icon-left" alt="">
                <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                <button type="button" class="toggle-password" id="toggle-password">
                  <img src="images/icons/eye.png" class="eye-icon" alt="Show">
                </button>
              </div>
            </div>
            <button type="submit" class="btn-submit">Update Password</button>
          </form>
        </div>
      </div>
    </div>
    `;

    setupPasswordToggle();

    const form = document.getElementById("reset-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById("password").value;
        const btn = form.querySelector(".btn-submit");

        btn.disabled = true;
        btn.textContent = "Updating...";

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();

            if (res.ok) {
                const container = document.querySelector(".auth-container");
                container.innerHTML = `
          <h2>Password Updated!</h2>
          <p>Your password has been successfully reset.</p>
          <p style="margin-top: 1rem; color: #aaa;">You can now close this tab and log in with your new password on your original device.</p>
          `;
            } else {
                alert(data.message || "Update failed");
            }
        } catch (error) {
            alert("Error updating password.");
            console.error(error);
        } finally {
            btn.disabled = false;
            btn.textContent = "Update Password";
        }
    });
}

/**
 * Helper to setup password visibility toggle for auth forms.
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
