import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function PricingCard({ plan }) {
    const { isAuthenticated } = useAuth();

    const handleBuyClick = (e) => {
        if (!isAuthenticated) {
            e.preventDefault();
            window.location.href = `/login?redirect=/checkout/${plan.id}`;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200 hover:border-blue-500 transition-all">
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
            <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">${plan.price}</span>
            </div>
            <p className="text-gray-600 mb-6">{plan.description}</p>
            <ul className="space-y-3 mb-8">
                {plan.features && plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <Link to={isAuthenticated ? `/checkout/${plan.id}` : `/login?redirect=/checkout/${plan.id}`} onClick={handleBuyClick}>
                <Button className="w-full">Buy Now</Button>
            </Link>
        </div>
    );
}
