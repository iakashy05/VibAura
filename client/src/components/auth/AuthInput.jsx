import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

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

export default AuthInput;
