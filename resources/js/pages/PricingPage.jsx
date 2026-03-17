import React, { useState, useEffect } from 'react';
import PricingCardDark from '../components/PricingCardDark';
import { plansApi } from '../api/plans';

export default function PricingPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        plansApi.getAll()
            .then((response) => {
                setPlans(response.data || []);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching plans:', err);
                setError('Failed to load plans. Please try again later.');
                setPlans([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-bold text-white text-center mb-14">
                    Choose your pricing plan
                </h1>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-blue-500"></div>
                        <p className="text-white/60">Loading plans...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-24">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-white/60 text-lg">No plans available at the moment.</p>
                        <p className="text-white/40 mt-2">Check back soon or contact us for more information.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <PricingCardDark
                                key={plan.id}
                                plan={plan}
                                isBestValue={plan.best_value || false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
