import React from 'react';

const Input = ({ 
  label, 
  icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-secondary ml-1">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center group">
        {icon && (
          <div className="absolute left-4 text-text-muted group-focus-within:text-vibaura-primary transition-colors">
            {icon}
          </div>
        )}
        
        <input
          className={`
            w-full bg-white border border-vibaura-border rounded-xl py-2.5 
            ${icon ? 'pl-11 pr-4' : 'px-4'} 
            text-text-primary placeholder:text-text-muted
            transition-all duration-200
            focus:outline-none focus:border-vibaura-primary focus:ring-4 focus:ring-vibaura-primary/10
            dark:bg-vibaura-dark-muted dark:border-vibaura-dark-border dark:text-vibaura-primary-dark
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
