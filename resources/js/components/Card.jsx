import React from 'react';

export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl shadow-xl p-6 backdrop-blur-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
