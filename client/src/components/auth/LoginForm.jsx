import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { login } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import AuthInput from './AuthInput';

// --- Validation Helpers ---
const validateEmail = (email) => {
  if (!email) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  return null;
};

const LoginForm = ({ onForgotClick, successMsg }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  const setAuth = useAuthStore(state => state.setAuth);

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const isFormValid = !emailError && !passwordError;

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) return;

    setLoading(true);
    setServerError(null);

    try {
      const data = await login(email, password);
      setAuth(data.user, data.token);
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black text-text-primary tracking-tight">
          Welcome Back to VibAura
        </h3>
        <p className="text-text-muted text-sm font-medium mt-1">
          Enter your credentials to access your personal aura.
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in duration-200">
          <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600 font-semibold">{serverError}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl animate-in fade-in duration-200">
          <p className="text-sm text-green-700 font-semibold">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          icon={faEnvelope}
          error={emailError}
          touched={touched.email}
        />

        <AuthInput
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          icon={faLock}
          error={passwordError}
          touched={touched.password}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="text-text-muted hover:text-vibaura-primary transition-colors duration-200"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
            </button>
          }
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotClick}
            className="text-xs font-black text-vibaura-primary hover:text-vibaura-primary-hover transition-colors uppercase tracking-wider"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-vibaura-primary hover:bg-vibaura-primary-hover text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-vibaura-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
