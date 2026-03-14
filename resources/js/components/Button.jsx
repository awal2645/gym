import React from 'react';

export default function Button({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, ...props }) {
    const baseClasses = 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50';
    
    const variants = {
        primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105',
        secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 backdrop-blur-sm hover:scale-105',
        danger: 'bg-red-600/90 text-white hover:bg-red-500 shadow-lg shadow-red-500/30 hover:scale-105',
        outline: 'border-2 border-white/20 text-white hover:bg-white/5 backdrop-blur-sm hover:scale-105',
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${disabledClasses} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
