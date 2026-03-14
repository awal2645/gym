import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CARD_IMAGE = 'https://static.wixstatic.com/media/043e76_3497af43232746a79d3ded83a3881005~mv2.png/v1/fill/w_622,h_320,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/043e76_3497af43232746a79d3ded83a3881005~mv2.png';

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
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-gray-900/80 border border-white/10'
            }`}
        >
            {isBestValue && (
                <div className="absolute top-0 left-0 right-0 z-10 flex justify-center -mt-px">
                    <span className="px-4 py-1.5 rounded-b-lg bg-sky-500/90 text-white text-sm font-semibold">
                        Best Value
                    </span>
                </div>
            )}
            <div className="h-24 overflow-hidden">
                <img
                    src={CARD_IMAGE}
                    alt=""
                    className="w-full h-full object-cover object-center"
                />
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                </div>
                <ul className="space-y-2 mb-4">
                    {plan.features?.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-white/90 text-sm">
                            <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
                <p className="text-white/60 text-sm mb-6">Valid for one month</p>
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
