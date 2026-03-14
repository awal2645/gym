import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Button from '../components/Button';
import { purchasesApi } from '../api/purchases';
import { plansApi } from '../api/plans';

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdmin } = useAuth();

    // Redirect: clients -> chat, admins -> admin
    useEffect(() => {
        if (isAdmin) {
            navigate('/admin', { replace: true });
            return;
        }
        navigate('/chat', { replace: true, state: location.state });
    }, [isAdmin, navigate, location.state]);
    const [purchases, setPurchases] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

    useEffect(() => {
        if (successMessage) {
            setTimeout(() => setSuccessMessage(''), 5000);
        }
    }, [successMessage]);

    useEffect(() => {
        Promise.all([
            purchasesApi.getMyPurchases(),
            plansApi.getAll(),
        ])
            .then(([purchasesRes, plansRes]) => {
                setPurchases(purchasesRes.data);
                setPlans(plansRes.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, []);

    const activePurchase = purchases.find((p) => p.status === 'completed');
    const activePlan = activePurchase ? plans.find((p) => p.id === activePurchase.plan_id) : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="flex items-center justify-center h-96 pt-24 lg:pt-32">
                    <div className="text-lg text-white/60">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-24 min-h-screen">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header with Chat Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            {!isAdmin && (
                                <Link to="/chat">
                                    <Button className="w-full sm:w-auto flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span>Chat Support</span>
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {successMessage && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl mb-4 lg:mb-6 text-sm sm:text-base">
                                {successMessage}
                            </div>
                        )}

                        {activePlan ? (
                            <>
                                <Card className="mb-6 lg:mb-8">
                                    <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Current Plan</h2>
                                    <div className="mb-3 sm:mb-4">
                                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{activePlan.name}</h3>
                                        <p className="text-sm sm:text-base text-white/60">{activePlan.description}</p>
                                    </div>
                                    <div className="mb-3 sm:mb-4">
                                        <p className="text-xs sm:text-sm text-white/50">
                                            Purchased on: {new Date(activePurchase.paid_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="mt-4 sm:mt-6">
                                        <h3 className="font-semibold mb-2 sm:mb-3 text-white text-base sm:text-lg">Course Modules:</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                            <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all">
                                                <h4 className="font-medium text-white mb-1 text-sm sm:text-base">Module 1: Introduction</h4>
                                                <p className="text-xs sm:text-sm text-white/60">Getting started with your fitness journey</p>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all">
                                                <h4 className="font-medium text-white mb-1 text-sm sm:text-base">Module 2: Workout Plans</h4>
                                                <p className="text-xs sm:text-sm text-white/60">Customized workout routines</p>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all">
                                                <h4 className="font-medium text-white mb-1 text-sm sm:text-base">Module 3: Nutrition Guide</h4>
                                                <p className="text-xs sm:text-sm text-white/60">Meal plans and nutrition tips</p>
                                            </div>
                                            <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all">
                                                <h4 className="font-medium text-white mb-1 text-sm sm:text-base">Module 4: Progress Tracking</h4>
                                                <p className="text-xs sm:text-sm text-white/60">Monitor your achievements</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {!isAdmin && (
                                    <Card className="mb-6 lg:mb-8">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Support</h2>
                                        <p className="text-sm sm:text-base text-white/60 mb-3 sm:mb-4">
                                            Need help? Chat with our support team for assistance with your training plan.
                                        </p>
                                        <Button onClick={() => navigate('/chat')} className="w-full sm:w-auto">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                Open Support Chat
                                            </span>
                                        </Button>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <Card>
                                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">No Active Plan</h2>
                                <p className="text-sm sm:text-base text-white/60 mb-4 sm:mb-6">
                                    You don't have an active plan yet. Choose a plan to get started with your fitness journey.
                                </p>
                                <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
                                    View Plans
                                </Button>
                            </Card>
                        )}

                        {purchases.length > 0 && (
                            <Card className="mt-6 lg:mt-8">
                                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Purchase History</h2>
                                <div className="space-y-3 sm:space-y-4">
                                    {purchases.map((purchase) => (
                                        <div key={purchase.id} className="border-b border-white/10 pb-3 sm:pb-4 last:border-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white text-sm sm:text-base mb-1">
                                                        {plans.find((p) => p.id === purchase.plan_id)?.name || 'Plan'}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-white/60 mb-1">
                                                        ${purchase.amount} - <span className="capitalize">{purchase.status}</span>
                                                    </p>
                                                    <p className="text-xs text-white/50">
                                                        {new Date(purchase.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}