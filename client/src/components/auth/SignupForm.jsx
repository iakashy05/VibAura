import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faEnvelope, faLock, faEye, faEyeSlash, faCircleExclamation, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { signup } from '../../services/authService';
import AuthInput from './AuthInput';

// --- Validation Helpers ---
const validateName = (name) => {
  if (!name || !name.trim()) return 'Full name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  return null;
};

const validateEmail = (email) => {
  if (!email) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
};

const SignupForm = ({ onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const isFormValid = !nameError && !emailError && !passwordError;

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  // Helper to calculate password strength from 0 to 4
  const getPasswordStrength = () => {
    return [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^a-zA-Z0-9]/.test(password),
    ].filter(Boolean).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!isFormValid) return;

    setLoading(true);
    setServerError(null);

    try {
      await signup(name, email, password);
      onSignupSuccess('Account created! You can now sign in.');
    } catch (err) {
      setServerError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black text-text-primary tracking-tight">
          Create Your Account
        </h3>
        <p className="text-text-muted text-sm font-medium mt-1">
          Sign up and start experiencing music differently.
        </p>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in duration-200">
          <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600 font-semibold">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthInput
          id="name"
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => handleBlur('name')}
          icon={faUserCircle}
          error={nameError}
          touched={touched.name}
        />

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
          placeholder="Create a strong password"
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

        {/* Password strength bar */}
        {password.length > 0 && (
          <div className="space-y-1.5 px-0.5 animate-in fade-in duration-200">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength
                      ? strength <= 1 ? 'bg-red-400'
                      : strength <= 2 ? 'bg-orange-400'
                      : strength <= 3 ? 'bg-yellow-400'
                      : 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-text-muted font-black tracking-widest uppercase">
              {['', 'Weak', 'Fair', 'Good', 'Strong'][strength] + ' password'}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={`
            w-full py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest
            flex items-center justify-center gap-3
            transition-all duration-200
            ${loading || !isFormValid
              ? 'bg-vibaura-primary/50 cursor-not-allowed'
              : 'bg-vibaura-primary hover:bg-vibaura-primary-hover shadow-lg shadow-vibaura-primary/20 hover:scale-[1.01] active:scale-[0.99]'
            }
          `}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Create My Account</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
