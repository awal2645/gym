import React, { useState, useEffect } from 'react';
import PricingCardDark from '../components/PricingCardDark';
import { plansApi } from '../api/plans';

export default function PricingPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        plansApi.getAll()
            .then((response) => setPlans(response.data))
            .catch((error) => console.error('Error fetching plans:', error))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-bold text-white text-center mb-14">
                    Choose your pricing plan
                </h1>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <PricingCardDark
                                key={plan.id}
                                plan={plan}
                                isBestValue={index === Math.floor(plans.length / 2)}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
