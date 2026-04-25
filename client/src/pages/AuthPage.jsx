import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faLock, faUserPlus, faSignInAlt,
  faMusic, faHeadphones, faMagic,
  faEye, faEyeSlash, faCheckCircle, faCircleExclamation,
  faUserCircle, faArrowLeft, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { login, signup, forgotPassword, verifyOTP, resetPassword } from '../services/authService';
import { useAuthStore } from '../store/authStore';

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

const validatePassword = (password, isLogin) => {
  if (!password) return 'Password is required.';
  if (!isLogin && password.length < 8) return 'Password must be at least 8 characters.';
  if (!isLogin && !/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!isLogin && !/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
};

// --- Reusable Input Field Component (inline for page scope) ---
const AuthInput = ({ type, id, label, placeholder, value, onChange, onBlur, icon, error, touched, rightElement }) => {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-xs font-bold text-text-muted uppercase tracking-widest ml-0.5">
        {label}
      </label>
      <div className="relative flex items-center">
        {/* Left Icon */}
        <span className={`absolute left-4 text-sm transition-colors duration-200 ${hasError ? 'text-red-400' : isValid ? 'text-green-500' : 'text-text-muted'}`}>
          <FontAwesomeIcon icon={icon} />
        </span>

        {/* Input */}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={type === 'email' ? 'email' : 'current-password'}
          className={`
            w-full py-3.5 pl-11 pr-${rightElement ? '12' : '11'} rounded-2xl text-sm font-medium
            border-2 bg-vibaura-bg-muted text-text-primary
            placeholder:text-text-muted/60 placeholder:font-normal
            transition-all duration-200 outline-none
            ${hasError
              ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100'
              : isValid
                ? 'border-green-300 focus:border-green-400 focus:ring-4 focus:ring-green-100'
                : 'border-transparent focus:border-vibaura-primary focus:ring-4 focus:ring-vibaura-primary/10'
            }
          `}
        />

        {/* Right Element (eye icon or validation icon) */}
        <span className="absolute right-4 flex items-center gap-1.5">
          {rightElement}
          {touched && (
            <FontAwesomeIcon
              icon={hasError ? faCircleExclamation : faCheckCircle}
              className={`text-sm ${hasError ? 'text-red-400' : 'text-green-500'}`}
            />
          )}
        </span>
      </div>

      {/* Error Message */}
      {hasError && (
        <p className="text-xs text-red-500 font-semibold ml-0.5 mt-0.5 flex items-center gap-1.5">
          {error}
        </p>
      )}
    </div>
  );
};


const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Forgot Password Flow States
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const otpRefs = useRef([]);

  // Touched state for progressive validation
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const setAuth = useAuthStore(state => state.setAuth);

  // Live validation
  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password, isLogin);
  const isFormValid = !emailError && !passwordError && (isLogin || !nameError);

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields to show validation on submit
    setTouched({ name: true, email: true, password: true });
    if (!isFormValid) return;

    setLoading(true);
    setServerError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const data = await login(email, password);
        setAuth(data.user, data.token);
      } else {
        await signup(name, email, password);
        setSuccessMsg('Account created! You can now sign in.');
        setIsLogin(true);
        setName('');
        setEmail('');
        setPassword('');
        setTouched({ name: false, email: false, password: false });
      }
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (loginMode) => {
    setIsLogin(loginMode);
    setServerError(null);
    setSuccessMsg(null);
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setTouched({ name: false, email: false, password: false });
  };

  // Auto-focus first OTP box when entering Step 2
  useEffect(() => {
    if (isForgot && forgotStep === 2 && otpRefs.current[0]) {
      setTimeout(() => {
        otpRefs.current[0].focus();
      }, 100);
    }
  }, [isForgot, forgotStep]);

  // --- Forgot Password Handlers ---
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (validateEmail(email)) return;
    setLoading(true);
    setServerError(null);
    try {
      await forgotPassword(email);
      setForgotStep(2);
      setSuccessMsg('OTP sent! Please check your email.');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only numbers
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last digit
    setOtp(newOtp);

    // Auto-focus next box
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }

    // AUTO-VERIFY: If the last digit is entered and all boxes have values
    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        // Use a tiny timeout to ensure state is updated and UI reflects the 6th digit
        setTimeout(() => {
          triggerAutoVerify(fullOtp);
        }, 50);
      }
    }
  };

  const triggerAutoVerify = async (otpString) => {
    setLoading(true);
    setServerError(null);
    try {
      await verifyOTP(email, otpString);
      setForgotStep(3);
      setSuccessMsg('OTP verified! Set your new password.');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPKeyDown = (index, e) => {
    // Backspace to previous box
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOTPSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return;
    setLoading(true);
    setServerError(null);
    try {
      await verifyOTP(email, otpString);
      setForgotStep(3);
      setSuccessMsg('OTP verified! Set your new password.');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const error = validatePassword(newPassword, false);
    if (error) {
      setServerError(error);
      return;
    }
    setLoading(true);
    setServerError(null);
    try {
      await resetPassword(email, otp.join(''), newPassword);
      setSuccessMsg('Password updated! You can now sign in.');
      setIsForgot(false);
      setIsLogin(true);
      setForgotStep(1);
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAuth = () => {
    setIsForgot(false);
    setForgotStep(1);
    setServerError(null);
    setSuccessMsg(null);
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col md:flex-row w-full h-full overflow-hidden bg-[#0a0a14]">

      {/* ─── LEFT PANEL: HERO ─── */}
      <div className="relative hidden md:flex flex-1 items-center justify-center overflow-hidden">
        <img
          src="/auth-hero.png"
          alt="VibAura — Feel the Sonic Aura"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-vibaura-primary/50 via-[#0a0a14]/30 to-[#0a0a14]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14]/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 px-14 text-white max-w-lg">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/25 shadow-2xl">
              <FontAwesomeIcon icon={faMusic} className="text-xl" />
            </div>
            <span className="text-2xl font-black tracking-widest uppercase opacity-90">VibAura</span>
          </div>

          <h2 className="text-6xl font-black mb-5 leading-[1.05] tracking-tighter">
            Feel the<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibaura-primary-light via-white to-vibaura-primary-light">
              Sonic Aura
            </span>
          </h2>
          <p className="text-white/60 text-base font-medium mb-10 leading-relaxed">
            Your personal universe of sound. Curated playlists, hi-res audio, and music that moves with you.
          </p>

          <div className="flex items-center gap-8 text-white/70 text-sm font-semibold">
            <div className="flex items-center gap-2.5">
              <FontAwesomeIcon icon={faHeadphones} className="text-vibaura-primary-light" />
              <span>Hi-Res Audio</span>
            </div>
            <div className="w-1 h-1 bg-white/30 rounded-full" />
            <div className="flex items-center gap-2.5">
              <FontAwesomeIcon icon={faMagic} className="text-vibaura-primary-light" />
              <span>AI Curated</span>
            </div>
          </div>
        </div>

        {/* Bottom animated progress bar */}
        <div className="absolute bottom-10 left-14 right-14 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 w-1/3 animate-progress-loop rounded-full" />
        </div>
      </div>

      {/* ─── RIGHT PANEL: AUTH CARD ─── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-vibaura-view-bg md:bg-[#f8f8ff]">

        {/* Mobile logo */}
        <div className="absolute top-6 left-6 md:hidden flex items-center gap-2">
          <div className="w-9 h-9 bg-vibaura-primary rounded-xl flex items-center justify-center text-white">
            <FontAwesomeIcon icon={faMusic} className="text-sm" />
          </div>
          <span className="text-xl font-black tracking-tighter text-text-primary">VibAura</span>
        </div>

        {/* THE CARD */}
        <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-vibaura-primary/10 border border-vibaura-border/30 overflow-hidden">

          {/* Card Header Tabs */}
          <div className="flex border-b border-vibaura-border/30">
            <button
              onClick={() => handleTabSwitch(true)}
              className={`flex-1 py-5 text-sm font-black tracking-wide uppercase transition-all duration-200 relative
                ${isLogin ? 'text-vibaura-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              Sign In
              {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibaura-primary rounded-full" />}
            </button>
            <button
              onClick={() => handleTabSwitch(false)}
              className={`flex-1 py-5 text-sm font-black tracking-wide uppercase transition-all duration-200 relative
                ${!isLogin ? 'text-vibaura-primary' : 'text-text-muted hover:text-text-secondary'}`}
            >
              Sign Up
              {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibaura-primary rounded-full" />}
            </button>
          </div>

          {/* Card Body */}
          <div className="p-8 space-y-6">

            {!isForgot ? (
              <>
                {/* Heading */}
                <div>
                  <h3 className="text-2xl font-black text-text-primary tracking-tight">
                    {isLogin ? 'Welcome Back' : 'Create Your Account'}
                  </h3>
                  <p className="text-text-muted text-sm font-medium mt-1">
                    {isLogin
                      ? 'Enter your credentials to access your personal aura.'
                      : 'Sign up and start experiencing music differently.'}
                  </p>
                </div>

                {/* Server Messages */}
                {serverError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                    <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-600 font-semibold">{serverError}</p>
                  </div>
                )}
                {successMsg && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-green-700 font-semibold">{successMsg}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Name - signup only */}
              {!isLogin && (
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
              )}

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
                placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
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

              {/* Password strength bar (signup only) */}
              {!isLogin && password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map(i => {
                      const strength = [
                        password.length >= 8,
                        /[A-Z]/.test(password),
                        /[0-9]/.test(password),
                        /[^a-zA-Z0-9]/.test(password),
                      ].filter(Boolean).length;
                      return (
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
                      );
                    })}
                  </div>
                  <p className="text-xs text-text-muted font-medium">
                    {(() => {
                      const s = [
                        password.length >= 8,
                        /[A-Z]/.test(password),
                        /[0-9]/.test(password),
                        /[^a-zA-Z0-9]/.test(password),
                      ].filter(Boolean).length;
                      return ['', 'Weak', 'Fair', 'Good', 'Strong'][s] + ' password';
                    })()}
                  </p>
                </div>
              )}

              {/* Forgot Password */}
              {isLogin && (
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-xs font-bold text-vibaura-primary hover:underline tracking-wide"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full h-[52px] rounded-2xl text-white text-sm font-black tracking-wide
                  flex items-center justify-center gap-3
                  transition-all duration-200
                  ${loading || !isFormValid
                    ? 'bg-vibaura-primary/50 cursor-not-allowed'
                    : 'bg-vibaura-primary hover:bg-vibaura-primary-hover shadow-lg shadow-vibaura-primary/25 hover:shadow-vibaura-primary/40 hover:scale-[1.01] active:scale-[0.99]'
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={isLogin ? faSignInAlt : faUserPlus} />
                    <span>{isLogin ? 'Sign In to VibAura' : 'Create My Account'}</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* ───── FORGOT PASSWORD FLOW ───── */
          <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={handleBackToAuth}
                className="flex items-center gap-2 text-xs font-black text-text-muted hover:text-vibaura-primary uppercase tracking-widest transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Login
              </button>

              {/* Step Heading */}
              <div>
                <h3 className="text-2xl font-black text-text-primary tracking-tight">
                  {forgotStep === 1 ? 'Reset Password' : forgotStep === 2 ? 'Verify OTP' : 'Set New Password'}
                </h3>
                <p className="text-text-muted text-sm font-medium mt-1 leading-relaxed">
                  {forgotStep === 1
                    ? 'Enter your email and we will send you a 6-digit verification code.'
                    : forgotStep === 2
                      ? `Enter the 6-digit code sent to ${email}.`
                      : 'Create a new secure password for your account.'}
                </p>
              </div>

              {/* Step 1: Email Form */}
              {forgotStep === 1 && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                  <AuthInput
                    id="forgot-email"
                    label="Email Address"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    icon={faEnvelope}
                    error={touched.email ? emailError : null}
                    touched={touched.email}
                    onBlur={() => handleBlur('email')}
                  />
                  <button
                    type="submit"
                    disabled={loading || emailError || !email}
                    className={`w-full h-[52px] rounded-2xl text-white text-sm font-black tracking-wide flex items-center justify-center gap-3 transition-all duration-200
                      ${loading || emailError || !email ? 'bg-vibaura-primary/50 cursor-not-allowed' : 'bg-vibaura-primary hover:bg-vibaura-primary-hover shadow-lg'}
                    `}
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Verification Code'}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Form */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOTPSubmit} className="space-y-8">
                  <div className="flex justify-between gap-2.5">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOTPChange(i, e.target.value)}
                        onKeyDown={e => handleOTPKeyDown(i, e)}
                        className="w-12 h-14 bg-vibaura-bg-muted border-2 border-transparent focus:border-vibaura-primary focus:ring-4 focus:ring-vibaura-primary/10 rounded-xl text-center text-xl font-black text-text-primary transition-all outline-none"
                      />
                    ))}
                  </div>
                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={loading || otp.join('').length < 6}
                      className={`w-full h-[52px] rounded-2xl text-white text-sm font-black tracking-wide flex items-center justify-center gap-3 transition-all duration-200
                        ${loading || otp.join('').length < 6 ? 'bg-vibaura-primary/50 cursor-not-allowed' : 'bg-vibaura-primary hover:bg-vibaura-primary-hover shadow-lg'}
                      `}
                    >
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Code'}
                    </button>
                    <p className="text-center text-xs font-bold text-text-muted uppercase tracking-widest">
                      Didn't get code? <button type="button" onClick={handleForgotPasswordSubmit} className="text-vibaura-primary hover:underline ml-1">Resend</button>
                    </p>
                  </div>
                </form>
              )}

              {/* Step 3: New Password Form */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                  <AuthInput
                    id="new-password"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    icon={faLock}
                    error={validatePassword(newPassword, false)}
                    touched={true}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="text-text-muted hover:text-vibaura-primary"
                        tabIndex={-1}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                      </button>
                    }
                  />
                  <button
                    type="submit"
                    disabled={loading || validatePassword(newPassword, false)}
                    className={`w-full h-[52px] rounded-2xl text-white text-sm font-black tracking-wide flex items-center justify-center gap-3 transition-all duration-200
                      ${loading || validatePassword(newPassword, false) ? 'bg-vibaura-primary/50 cursor-not-allowed' : 'bg-vibaura-primary hover:bg-vibaura-primary-hover shadow-lg'}
                    `}
                  >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="px-8 pb-7 text-center">
            <p className="text-sm text-text-muted font-medium">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                onClick={() => handleTabSwitch(!isLogin)}
                className="text-vibaura-primary font-black hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* ─── ANIMATIONS ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slow-zoom {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.12); }
        }
        @keyframes progress-loop {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        .animate-slow-zoom { animation: slow-zoom 20s ease-in-out infinite; }
        .animate-progress-loop { animation: progress-loop 3s linear infinite; }
      `}} />
    </div>
  );
};

export default AuthPage;
