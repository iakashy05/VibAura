import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  icon, 
  className = '', 
  inputClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-[#999] dark:text-text-muted uppercase tracking-tighter ml-2">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center group">
        {icon && (
          <div className="absolute left-5 text-[#BBB] group-focus-within:text-vibaura-primary transition-colors">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full bg-[#F5F5F7] dark:bg-vibaura-bg-muted/30 border border-[#E9E9EB] dark:border-white/5 rounded-[24px] py-4
            ${icon ? 'pl-14 pr-6' : 'px-6'} 
            text-[#1A1A1A] dark:text-text-primary placeholder-[#CCC] dark:placeholder-text-muted font-bold text-sm
            transition-all duration-300
            focus:outline-none focus:border-vibaura-primary dark:focus:border-vibaura-primary/50 focus:bg-white dark:focus:bg-vibaura-surface focus:shadow-lg focus:shadow-black/5
            ${inputClassName}
          `}
          {...props}
        />
      </div>
    </div>
  );
});

export default Input;
