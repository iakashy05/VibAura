import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import ForgotPasswordFlow from '../components/auth/ForgotPasswordFlow';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleTabSwitch = (loginMode) => {
    setIsLogin(loginMode);
    setSuccessMsg(null);
  };

  const handleSignupSuccess = (msg) => {
    setSuccessMsg(msg);
    setIsLogin(true);
  };

  const handleResetSuccess = (msg) => {
    setSuccessMsg(msg);
    setIsForgot(false);
    setIsLogin(true);
  };

  const handleBackToAuth = () => {
    setIsForgot(false);
    setSuccessMsg(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col md:flex-row w-full h-full overflow-hidden bg-[#0a0a14] animate-in fade-in duration-500">

      {/* ─── LEFT PANEL: HERO ─── */}
      <div className="relative hidden md:flex w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460]">
        {/* Dynamic Glowing Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-vibaura-primary/30 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/30 blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-500/20 blur-[100px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 px-14 text-white max-w-lg flex flex-col items-center text-center">
          <div className="mb-10">
            <div className="w-48 h-48 drop-shadow-[0_10px_25px_rgba(99,103,255,0.4)]">
              <img src="/logo.webp" alt="VibAura Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <h2 className="text-6xl font-black mb-5 leading-[1.05] tracking-tighter">
            Feel the<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibaura-primary-light via-white to-vibaura-primary-light">
              Rhythmic Vibe
            </span>
          </h2>
          <p className="text-white/70 text-base font-medium leading-relaxed">
            Your world, perfectly tuned. Experience the rhythm of VibAura with every beat.
          </p>
        </div>

        {/* Bottom Music Wave Visualizer */}
        <div className="absolute bottom-12 left-14 right-14 flex items-center justify-center gap-1.5 h-12 opacity-40">
          {[...Array(40)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 bg-white/60 rounded-full animate-wave"
              style={{ 
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${0.5 + Math.random() * 1}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* ─── RIGHT PANEL: AUTH CARD ─── */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center p-6 bg-vibaura-view-bg md:bg-[#f8f8ff] relative">

        {/* THE CARD */}
        <div className="w-full max-w-md bg-white rounded-[32px] shadow-[0_20px_50px_rgba(99,103,255,0.08)] border border-vibaura-border/30 overflow-hidden animate-scale-in relative z-10">


          {/* Card Header Tabs - Hide when on Forgot Password Flow */}
          {!isForgot && (
            <div className="flex border-b border-vibaura-border/30 bg-vibaura-bg-muted/30">
              <button
                onClick={() => handleTabSwitch(true)}
                className={`flex-1 py-5 text-xs font-black tracking-widest uppercase transition-all duration-200 relative
                  ${isLogin ? 'text-vibaura-primary' : 'text-text-muted hover:text-text-secondary'}`}
              >
                Sign In
                {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibaura-primary rounded-full animate-fade-in" />}
              </button>
              <button
                onClick={() => handleTabSwitch(false)}
                className={`flex-1 py-5 text-xs font-black tracking-widest uppercase transition-all duration-200 relative
                  ${!isLogin ? 'text-vibaura-primary' : 'text-text-muted hover:text-text-secondary'}`}
              >
                Sign Up
                {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibaura-primary rounded-full animate-fade-in" />}
              </button>
            </div>
          )}

          {/* Card Body */}
          <div className="p-8">
            {isForgot ? (
              <ForgotPasswordFlow 
                onBackClick={handleBackToAuth} 
                onResetSuccess={handleResetSuccess}
              />
            ) : isLogin ? (
              <LoginForm 
                onForgotClick={() => setIsForgot(true)} 
                successMsg={successMsg}
              />
            ) : (
              <SignupForm 
                onSignupSuccess={handleSignupSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
