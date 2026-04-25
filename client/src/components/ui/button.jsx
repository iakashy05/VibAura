import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  ...props 
}) => {
  // Base style for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-jost font-medium rounded-full transition-all duration-200 active:scale-95 focus:outline-none';
  
  // Design variants mapped to your VibAura theme
  const variants = {
    primary: 'bg-vibaura-primary text-white hover:bg-opacity-90 shadow-md hover:shadow-lg',
    secondary: 'bg-vibaura-primary-light text-vibaura-primary hover:bg-vibaura-primary-hover',
    outline: 'border-2 border-vibaura-primary text-vibaura-primary hover:bg-vibaura-primary hover:text-white',
    ghost: 'bg-transparent text-text-primary hover:bg-vibaura-bg-muted',
  };

  // Size variations
  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
    icon: 'p-2', // For square/circle icon buttons
  };

  const combinedClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={combinedClasses} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default Button;
