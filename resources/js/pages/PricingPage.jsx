import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { plansApi } from '../api/plans';
import { useAuth } from '../context/AuthContext';
import {
    STATIC_TIERS,
    mergeStaticTiersWithPlans,
    oldPriceForDiscount20,
    priceDollarSuffix,
} from '../data/pricingTiers';

export default function PricingPage() {
    const { isAuthenticated } = useAuth();
    const [apiPlans, setApiPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const rows = useMemo(() => mergeStaticTiersWithPlans(apiPlans), [apiPlans]);

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

    if (!rows) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black px-4 text-center text-sm text-white/75">
                {apiPlans.length === 0
                    ? 'No plans available at the moment.'
                    : `Pricing needs exactly ${STATIC_TIERS.length} plans in the database (you have ${apiPlans.length}).`}
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
                    {rows.map(({ title, lines, plan }, index) => {
                        const isFeatured = index === 1;
                        const oldPriceStr = isFeatured ? oldPriceForDiscount20(plan.price) : null;
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
                                        {title}
                                    </h3>

                                    {oldPriceStr && (
                                        <div className="mt-2 flex flex-wrap items-baseline justify-center gap-x-1 text-center text-lg font-bold text-white/45 line-through sm:text-xl">
                                            <span>{oldPriceStr}</span>
                                            <span className="text-xs font-medium text-white/40">/ mo</span>
                                        </div>
                                    )}

                                    <div
                                        className={[
                                            'flex flex-wrap items-baseline justify-center gap-x-1 text-center font-extrabold leading-none text-white',
                                            isFeatured ? 'mt-1 text-4xl sm:text-5xl' : 'mt-3 text-4xl sm:text-5xl',
                                        ].join(' ')}
                                    >
                                        <span>{priceDollarSuffix(plan.price)}</span>
                                        <span className="text-sm font-semibold text-white/60 sm:text-base">/ mo</span>
                                    </div>

                                    <ul className="mt-4 list-disc space-y-1.5 pl-4 text-left text-xs leading-snug text-white/85 marker:text-white/70 sm:mt-5 sm:space-y-2 sm:pl-5 sm:text-sm">
                                        {lines.map((line, fi) => (
                                            <li key={`${plan.id}-${fi}`}>{line}</li>
                                        ))}
                                    </ul>
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
