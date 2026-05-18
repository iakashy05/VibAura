import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faCircleExclamation, faCheckCircle, faLock, faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { forgotPassword, verifyOTP, resetPassword } from '../../services/authService';
import AuthInput from './AuthInput';

// --- Validation Helpers ---
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

const ForgotPasswordFlow = ({ onBackClick, onResetSuccess }) => {
  const [email, setEmail] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [touched, setTouched] = useState({ email: false });

  const otpRefs = useRef([]);

  const emailError = validateEmail(email);
  const passwordError = validatePassword(newPassword);

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  // Auto-focus first OTP box when entering Step 2
  useEffect(() => {
    if (forgotStep === 2 && otpRefs.current[0]) {
      setTimeout(() => {
        otpRefs.current[0].focus();
      }, 100);
    }
  }, [forgotStep]);

  // --- Step 1: Request OTP ---
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
      setServerError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: OTP Input Grid & Verify ---
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
      setServerError(err.message || 'Incorrect or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOTPSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return;
    triggerAutoVerify(otpString);
  };

  // --- Step 3: Password Update ---
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const error = validatePassword(newPassword);
    if (error) {
      setServerError(error);
      return;
    }
    setLoading(true);
    setServerError(null);
    try {
      await resetPassword(email, otp.join(''), newPassword);
      onResetSuccess('Password updated! You can now sign in.');
    } catch (err) {
      setServerError(err.message || 'Reset password failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="flex items-center gap-2 text-xs font-black text-text-muted hover:text-vibaura-primary uppercase tracking-widest transition-colors outline-none"
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

      {/* Server Messages */}
      {serverError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in fade-in duration-200">
          <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600 font-semibold">{serverError}</p>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl animate-in fade-in duration-200">
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm text-green-700 font-semibold">{successMsg}</p>
        </div>
      )}

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
            className={`w-full h-[52px] rounded-2xl text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-200
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
          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className={`w-full h-[52px] rounded-2xl text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-200
              ${loading || otp.join('').length < 6 ? 'bg-vibaura-primary/50 cursor-not-allowed' : 'bg-vibaura-primary hover:bg-vibaura-primary-hover shadow-lg'}
            `}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verify Code'}
          </button>
        </form>
      )}

      {/* Step 3: New Password Form */}
      {forgotStep === 3 && (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
          <AuthInput
            id="reset-password"
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            icon={faLock}
            error={passwordError}
            touched={!!newPassword}
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
          <button
            type="submit"
            disabled={loading || passwordError || !newPassword}
            className={`w-full h-[52px] rounded-2xl text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-200
              ${loading || passwordError || !newPassword ? 'bg-vibaura-primary/50 cursor-not-allowed' : 'bg-vibaura-primary hover:bg-vibaura-primary-hover shadow-lg'}
            `}
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordFlow;
