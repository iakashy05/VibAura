import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  icon, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-[#999] uppercase tracking-tighter ml-2">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center group">
        {icon && (
          <div className="absolute left-6 text-[#BBB] group-focus-within:text-vibaura-primary transition-colors">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full bg-[#F5F5F7] border border-[#E9E9EB] rounded-[24px] py-4
            ${icon ? 'pl-16 pr-6' : 'px-6'} 
            text-[#1A1A1A] placeholder-[#CCC] font-bold text-sm
            transition-all duration-300
            focus:outline-none focus:border-vibaura-primary focus:bg-white focus:shadow-lg focus:shadow-vibaura-primary/5
          `}
          {...props}
        />
      </div>
    </div>
  );
});

export default Input;
