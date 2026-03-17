import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PricingCardDark({ plan, isBestValue = false }) {
    const { isAuthenticated } = useAuth();

    const handleSelectClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            window.open(`/login?redirect=/checkout/${plan.id}`, '_blank');
        }
    };

    return (
        <div
            className={`relative rounded-xl overflow-hidden ${
                isBestValue
                    ? 'bg-white border border-gray-200'
                    : 'bg-gray-900/80 border border-white/10'
            }`}
        >
            {isBestValue && (
                <div className="absolute top-2 right-2 z-20 rotate-12 px-3 py-1.5 bg-emerald-500 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-1.5">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Best Value
                </div>
            )}
            <div className="p-6">
                <h3 className={`text-xl font-bold mb-2 ${isBestValue ? 'text-gray-900' : 'text-white'}`}>{plan.name}</h3>
                <div className="mb-4">
                    <span className={`text-4xl font-bold ${isBestValue ? 'text-gray-900' : 'text-white'}`}>${plan.price}</span>
                </div>
                <ul className="space-y-2 mb-4">
                    {plan.features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                            <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className={isBestValue ? 'text-gray-700' : 'text-white/90'}>{feature}</span>
                        </li>
                    ))}
                </ul>
                <p className={`text-sm mb-6 ${isBestValue ? 'text-gray-500' : 'text-white/60'}`}>Valid for one month</p>
                <Link
                    to={isAuthenticated ? `/checkout/${plan.id}` : `/login?redirect=/checkout/${plan.id}`}
                    onClick={handleSelectClick}
                    className="block w-full py-3 px-4 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-semibold text-center transition-colors"
                >
                    Select
                </Link>
            </div>
        </div>
    );
}
