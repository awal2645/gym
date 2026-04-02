import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { plansApi } from '../api/plans';
import { checkoutApi } from '../api/checkout';
import { configApi } from '../api/config';
import {
    getStaticTierForPlan,
    oldPriceForDiscount20,
    priceDollarSuffix,
} from '../data/pricingTiers';

export default function Checkout() {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [allPlans, setAllPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [capturing, setCapturing] = useState(false);
    const [orderData, setOrderData] = useState(null);
    /** PayPal calls onApprove before React applies setOrderData; keep latest meta in a ref. */
    const orderMetaRef = useRef(null);
    const [paypalConfig, setPaypalConfig] = useState({ clientId: '', active: false });

    const staticTier = useMemo(
        () => (plan && allPlans.length ? getStaticTierForPlan(plan, allPlans) : null),
        [plan, allPlans],
    );
    const checkoutOldPriceStr =
        staticTier?.isFeatured && plan ? oldPriceForDiscount20(plan.price) : null;

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError('');
        Promise.all([
            plansApi.getById(planId),
            plansApi.getAll().catch(() => ({ data: [] })),
        ])
            .then(([byIdRes, allRes]) => {
                if (cancelled) {
                    return;
                }
                setPlan(byIdRes.data);
                setAllPlans(allRes.data || []);
            })
            .catch(() => {
                if (!cancelled) {
                    setError('Plan not found');
                    setPlan(null);
                    setAllPlans([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [planId]);

    useEffect(() => {
        configApi.getPaypal()
            .then((response) => {
                const d = response.data;
                setPaypalConfig({
                    clientId: d?.client_id || d?.clientId || '',
                    active: d?.active ?? true,
                });
            })
            .catch(() => setPaypalConfig({ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '', active: false }));
    }, []);

    const createOrder = async () => {
        try {
            const response = await checkoutApi.createOrder({ plan_id: parseInt(planId) });
            orderMetaRef.current = response.data;
            setOrderData(response.data);
            return response.data.payment_id;
        } catch (err) {
            orderMetaRef.current = null;
            setError(err.response?.data?.message || 'Failed to create order');
            throw err;
        }
    };

    const onApprove = async (data) => {
        const meta = orderMetaRef.current;
        if (!meta?.purchase_id) {
            setError('Session expired. Please try again.');
            return;
        }
        setCapturing(true);
        setError('');
        try {
            const orderId = data.orderID || data.paymentID;
            if (!orderId) {
                setError('Invalid payment response from PayPal.');
                setCapturing(false);
                return;
            }
            const response = await checkoutApi.captureOrder({
                payment_id: orderId,
                payer_id: data.payerID || data.payerId || '',
                purchase_id: meta.purchase_id,
            });

            const purchase = response.data?.purchase;
            if (purchase) {
                navigate('/account?purchased=1', { state: { success: true, purchase } });
            } else {
                setError(
                    'Payment may have succeeded but we could not load confirmation. Open Account to verify your plan.',
                );
            }
        } catch (err) {
            const res = err.response?.data;
            let msg = res?.message || 'Payment failed. Please try again.';
            const detail = res?.paypal_message || res?.error?.details?.[0]?.description || res?.error?.message;
            if (detail) {
                msg += ` — ${detail}`;
            }
            setError(msg);
        } finally {
            setCapturing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="flex items-center justify-center h-96 pt-32">
                    <div className="text-lg text-white/60">Loading...</div>
                </div>
            </div>
        );
    }

    if (error && !plan) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="flex items-center justify-center h-96 pt-32">
                    <div className="text-red-400">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
                <h1 className="mb-8 text-4xl font-bold text-white">Checkout</h1>

                {(error || capturing) && (
                    <div className="mb-6 space-y-2">
                        {capturing && (
                            <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-4 py-3 rounded-xl flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                Processing your payment...
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div
                        className={[
                            'relative flex flex-col rounded-xl border border-white/15 bg-zinc-950 px-4 py-5 shadow-lg sm:px-5 sm:py-6',
                            staticTier?.isFeatured ? 'z-10 ring-2 ring-[#1877F2]' : '',
                        ].join(' ')}
                    >
                        {staticTier?.isFeatured && (
                            <div className="absolute right-0 top-3 flex h-7 min-w-[88px] items-center justify-center bg-[#1877F2] px-2 text-[10px] font-extrabold tracking-wide text-white [clip-path:polygon(18%_0,100%_0,100%_100%,18%_100%,0_50%)] sm:top-4 sm:h-8 sm:min-w-[100px] sm:text-xs">
                                Best Value
                            </div>
                        )}

                        {staticTier && plan ? (
                            <>
                                <h2 className="text-center text-base font-semibold uppercase tracking-wide text-white sm:text-lg">
                                    {staticTier.title}
                                </h2>
                                {staticTier.isFeatured && checkoutOldPriceStr && (
                                    <div className="mt-2 flex flex-wrap items-baseline justify-center gap-x-1 text-center text-lg font-bold text-white/45 line-through sm:text-xl">
                                        <span>{checkoutOldPriceStr}</span>
                                        <span className="text-xs font-medium text-white/40">/ mo</span>
                                    </div>
                                )}
                                <div
                                    className={[
                                        'flex flex-wrap items-baseline justify-center gap-x-1 text-center font-extrabold leading-none text-white',
                                        staticTier.isFeatured ? 'mt-1 text-4xl sm:text-5xl' : 'mt-3 text-4xl sm:text-5xl',
                                    ].join(' ')}
                                >
                                    <span>{priceDollarSuffix(plan.price)}</span>
                                    <span className="text-sm font-semibold text-white/60 sm:text-base">/ mo</span>
                                </div>
                                <ul className="mt-4 list-disc space-y-1.5 pl-4 text-left text-xs leading-snug text-white/85 marker:text-white/70 sm:mt-5 sm:space-y-2 sm:pl-5 sm:text-sm">
                                    {staticTier.lines.map((line, fi) => (
                                        <li key={fi}>{line}</li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <h2 className="mb-4 text-2xl font-bold text-white">{plan?.name}</h2>
                                <p className="mb-6 text-white/60">{plan?.description}</p>
                                <div className="mb-6 flex flex-wrap items-baseline gap-x-1">
                                    <span className="text-4xl font-extrabold text-white">{priceDollarSuffix(plan?.price)}</span>
                                    <span className="text-lg font-medium text-white/60">/ mo</span>
                                </div>
                                {plan?.features?.length > 0 && (
                                    <div>
                                        <h3 className="mb-3 font-semibold text-white">Features</h3>
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start text-white/80">
                                                    <span className="mr-2 mt-0.5 text-green-400">✓</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <Card>
                        <h2 className="text-2xl font-bold mb-4 text-white">Payment</h2>
                        {paypalConfig.active && paypalConfig.clientId ? (
                            <PayPalScriptProvider
                                options={{
                                    clientId: paypalConfig.clientId,
                                    currency: 'USD',
                                    intent: 'capture',
                                }}
                            >
                                <PayPalButtons
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onCancel={() => {
                                        setError('');
                                    }}
                                    onError={(err) => {
                                        console.error('PayPal error:', err);
                                        const detail =
                                            typeof err === 'string'
                                                ? err
                                                : err?.message || err?.toString?.() || 'PayPal could not complete this step.';
                                        setError(detail);
                                    }}
                                />
                            </PayPalScriptProvider>
                        ) : (
                            <div className="text-amber-400">
                                {paypalConfig.active
                                    ? 'PayPal is not configured. Please contact support.'
                                    : 'PayPal payments are currently unavailable. Please check back later.'}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}