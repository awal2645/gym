import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { plansApi } from '../api/plans';
import { useAuth } from '../context/AuthContext';
import { formatUsdPrice } from '../data/pricingTiers';

export default function PricingPage() {
    const { isAuthenticated } = useAuth();
    const [apiPlans, setApiPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const plans = useMemo(
        () => [...apiPlans].sort((a, b) => Number(a.price) - Number(b.price)),
        [apiPlans],
    );

    useEffect(() => {
        plansApi
            .getAll()
            .then((res) => {
                setApiPlans(res.data || []);
                setError(null);
            })
            .catch(() => {
                setError('Failed to load plans. Please try again later.');
                setApiPlans([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-black px-4 text-center text-white">
                <p className="text-sm text-red-400">{error}</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-md border-2 border-[#1877F2] bg-[#1877F2] px-4 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-[#166FE5]"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black px-4 text-center text-sm text-white/75">
                No plans available at the moment.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black px-3 py-5 text-white sm:px-4 sm:py-6 md:px-6">
            <div className="mx-auto max-w-5xl">
                <div className="text-center">
                    <h1 className="text-xl font-extrabold uppercase tracking-wide text-white sm:text-2xl">
                        Choose a Plan
                    </h1>
                    <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-[#1877F2] sm:mt-3 sm:w-28" />
                    <p className="mx-auto mt-3 max-w-2xl text-xs font-medium leading-snug text-white/75 sm:mt-4 sm:text-sm">
                        A few words about your product/offer. Focus on the benefits not the features. Explain how your
                        product will improve your customer&apos;s life.
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-7 sm:gap-4 lg:mt-8 lg:grid-cols-3 lg:items-stretch lg:gap-3">
                    {plans.map((plan) => {
                        const isFeatured = !!plan.best_value;
                        const checkoutPath = `/checkout/${plan.id}`;
                        const loginHref = `/login?redirect=${encodeURIComponent(checkoutPath)}`;

                        return (
                            <div
                                key={plan.id}
                                className={[
                                    'relative flex flex-col justify-between rounded-xl border border-white/15 bg-zinc-950 px-4 py-5 shadow-lg sm:px-5 sm:py-6',
                                    isFeatured ? 'z-10 ring-2 ring-[#1877F2]' : '',
                                ].join(' ')}
                            >
                                {isFeatured && (
                                    <div className="absolute right-0 top-3 flex h-7 min-w-[88px] items-center justify-center bg-[#1877F2] px-2 text-[10px] font-extrabold tracking-wide text-white [clip-path:polygon(18%_0,100%_0,100%_100%,18%_100%,0_50%)] sm:top-16 sm:h-8 sm:min-w-[100px] sm:text-xs">
                                        Best Value
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-center text-base font-semibold uppercase tracking-wide text-white sm:text-lg">
                                        {plan.name}
                                    </h3>

                                    {plan.description ? (
                                        <p className="mt-2 text-center text-xs italic leading-snug text-white/65 sm:text-sm">
                                            {plan.description}
                                        </p>
                                    ) : null}

                                    <div
                                        className={[
                                            'flex flex-wrap items-baseline justify-center gap-x-1 text-center font-extrabold leading-none text-white',
                                            plan.description ? 'mt-3 text-4xl sm:text-5xl' : 'mt-3 text-4xl sm:text-5xl',
                                        ].join(' ')}
                                    >
                                        <span>{formatUsdPrice(plan.price)}</span>
                                        <span className="text-sm font-semibold text-white/60 sm:text-base">/ mo</span>
                                    </div>

                                    {plan.features?.length > 0 ? (
                                        <ul className="mt-4 space-y-2 sm:mt-5">
                                            {plan.features.map((line, fi) => (
                                                <li
                                                    key={`${plan.id}-${fi}`}
                                                    className="flex items-start gap-2 text-left text-xs leading-snug text-white/85 sm:text-sm"
                                                >
                                                    <svg
                                                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        aria-hidden
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span>{line}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </div>

                                <Link
                                    to={isAuthenticated ? checkoutPath : loginHref}
                                    className={[
                                        'mt-4 block w-full rounded-md py-2.5 text-center text-xs font-extrabold uppercase tracking-wide sm:mt-5 sm:py-3 sm:text-sm',
                                        isFeatured
                                            ? 'bg-[#1877F2] text-white hover:bg-[#166FE5]'
                                            : 'border-2 border-[#1877F2] bg-transparent text-white hover:bg-white/10',
                                    ].join(' ')}
                                >
                                    Register Now
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
