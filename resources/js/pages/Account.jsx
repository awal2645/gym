import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { purchasesApi } from '../api/purchases';

export default function Account() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const purchaseJustCompleted =
        Boolean(location.state?.success) || searchParams.get('purchased') === '1';
    const [successMessage, setSuccessMessage] = useState(
        purchaseJustCompleted ? 'Payment successful! Your plan is now active.' : '',
    );

    useEffect(() => {
        if (searchParams.get('purchased') === '1') {
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 6000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        purchasesApi.getMyPurchases()
            .then((response) => setPurchases(response.data || []))
            .catch(() => setPurchases([]))
            .finally(() => setLoading(false));
    }, []);

    const completedPurchases = purchases.filter((p) => p.status === 'completed');
    const currentPlan = completedPurchases[0]?.plan;
    const latestPurchase = completedPurchases[0];

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <Sidebar />
                <main className="lg:ml-64 pt-24 min-h-screen">
                    <div className="flex flex-col items-center justify-center h-96 gap-4">
                        <div className="w-12 h-12 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-white/60">Loading...</span>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-24 min-h-screen">
                <div className="p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
                            My Account
                        </h1>
                        <p className="text-white/60 mb-8">Your plan details and purchase history.</p>

                        {successMessage && (
                            <div className="mb-8 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center gap-3">
                                <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {successMessage}
                            </div>
                        )}

                        {/* Current Plan */}
                        {currentPlan ? (
                            <Card className="mb-8">
                                <h2 className="text-xl font-bold text-white mb-4">Current Plan</h2>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{currentPlan.name}</h3>
                                        <p className="text-white/60 mt-1">{currentPlan.description}</p>
                                        {latestPurchase?.paid_at && (
                                            <p className="text-sm text-white/50 mt-2">
                                                Activated on {formatDate(latestPurchase.paid_at)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                                            ${parseFloat(currentPlan.price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                {currentPlan.features?.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <h4 className="font-semibold text-white mb-3">Plan includes:</h4>
                                        <ul className="space-y-2">
                                            {currentPlan.features.map((feature, i) => (
                                                <li key={i} className="flex items-center gap-2 text-white/90">
                                                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="mt-6">
                                    <Button onClick={() => navigate('/chat')}>
                                        Go to Chat Support
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Card className="mb-8">
                                <h2 className="text-xl font-bold text-white mb-4">No Active Plan</h2>
                                <p className="text-white/60 mb-6">You don't have an active plan. Choose a plan to get started.</p>
                                <Button onClick={() => navigate('/pricing')}>View Plans</Button>
                            </Card>
                        )}

                        {/* Purchase History */}
                        <Card>
                            <h2 className="text-xl font-bold text-white mb-4">Purchase History</h2>
                            {purchases.length === 0 ? (
                                <p className="text-white/60">No purchases yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {purchases.map((purchase) => (
                                        <div
                                            key={purchase.id}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                                        >
                                            <div>
                                                <h3 className="font-semibold text-white">
                                                    {purchase.plan?.name || 'Plan'}
                                                </h3>
                                                <p className="text-sm text-white/50 mt-0.5">
                                                    {formatDate(purchase.paid_at || purchase.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-semibold text-white">
                                                    ${parseFloat(purchase.amount || 0).toFixed(2)}
                                                </span>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                                        purchase.status === 'completed'
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : purchase.status === 'pending'
                                                            ? 'bg-amber-500/20 text-amber-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                    }`}
                                                >
                                                    {purchase.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
