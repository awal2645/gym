import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import { plansApi } from '../api/plans';
import { checkoutApi } from '../api/checkout';

export default function Checkout() {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [paypalClientId] = useState(import.meta.env.VITE_PAYPAL_CLIENT_ID || '');

    useEffect(() => {
        plansApi.getById(planId)
            .then((response) => {
                setPlan(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError('Plan not found');
                setLoading(false);
            });
    }, [planId]);

    const createOrder = async () => {
        try {
            const response = await checkoutApi.createOrder({ plan_id: parseInt(planId) });
            setOrderData(response.data);
            return response.data.payment_id;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create order');
            throw err;
        }
    };

    const onApprove = async (data) => {
        try {
            const response = await checkoutApi.captureOrder({
                payment_id: data.paymentID,
                payer_id: data.payerID,
                purchase_id: orderData.purchase_id,
            });

            if (response.data.purchase) {
                navigate('/chat', { state: { message: 'Payment successful! You now have access to your plan.' } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed. Please try again.');
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
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Checkout</h1>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <h2 className="text-2xl font-bold mb-4 text-white">{plan?.name}</h2>
                        <p className="text-white/60 mb-6">{plan?.description}</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">${plan?.price}</span>
                        </div>
                        {plan?.features && (
                            <div>
                                <h3 className="font-semibold mb-3 text-white">Features:</h3>
                                <ul className="space-y-2">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-white/80">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h2 className="text-2xl font-bold mb-4 text-white">Payment</h2>
                        {paypalClientId ? (
                            <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                                <PayPalButtons
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onError={(err) => setError('PayPal error occurred')}
                                />
                            </PayPalScriptProvider>
                        ) : (
                            <div className="text-red-400">PayPal client ID not configured</div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}