import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import { adminApi } from '../../api/admin';

export default function AdminPurchases() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPurchases();
    }, []);

    const loadPurchases = () => {
        setError(null);
        adminApi.purchases.getAll()
            .then((response) => {
                setPurchases(response.data || []);
            })
            .catch((err) => {
                console.error('Error loading purchases:', err);
                setError('Failed to load purchases');
                setPurchases([]);
            })
            .finally(() => setLoading(false));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            failed: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        const style = styles[status] || 'bg-white/10 text-white/60 border-white/10';
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${style}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <Sidebar />
                <main className="lg:ml-64 pt-24 min-h-screen">
                    <div className="flex flex-col items-center justify-center h-96 gap-4">
                        <div className="w-12 h-12 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-white/60">Loading purchases...</span>
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
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                All Purchases
                            </h1>
                            <p className="mt-2 text-white/60">View customer orders and PayPal payment history.</p>
                        </div>

                        {error ? (
                            <Card className="py-12 text-center">
                                <p className="text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={loadPurchases}
                                    className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                                >
                                    Retry
                                </button>
                            </Card>
                        ) : purchases.length === 0 ? (
                            <Card className="py-16 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No purchases yet</h3>
                                <p className="text-white/60">Purchases will appear here when customers buy plans via PayPal.</p>
                            </Card>
                        ) : (
                            <Card className="overflow-hidden p-0">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                                    Plan
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {purchases.map((purchase) => (
                                                <tr key={purchase.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-white">
                                                            {purchase.user?.name || '—'}
                                                        </div>
                                                        <div className="text-sm text-white/50">
                                                            {purchase.user?.email || '—'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-white/90">
                                                        {purchase.plan?.name || '—'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-semibold text-white">
                                                            ${parseFloat(purchase.amount || 0).toFixed(2)}
                                                        </span>
                                                        {purchase.currency && (
                                                            <span className="text-white/50 text-xs ml-1">{purchase.currency}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={purchase.status} />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-white/60">
                                                        {formatDate(purchase.paid_at || purchase.created_at)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
