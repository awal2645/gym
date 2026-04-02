import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { adminApi } from '../../api/admin';

export default function AdminPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        features: '',
        active: true,
        best_value: false,
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = () => {
        adminApi.plans.getAll()
            .then((response) => {
                setPlans(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error loading plans:', error);
                setLoading(false);
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const features = formData.features.split('\n').filter((f) => f.trim());

        try {
            if (editingPlan) {
                await adminApi.plans.update(editingPlan.id, {
                    ...formData,
                    price: parseFloat(formData.price),
                    features,
                    best_value: formData.best_value,
                });
            } else {
                await adminApi.plans.create({
                    ...formData,
                    price: parseFloat(formData.price),
                    features,
                    best_value: formData.best_value,
                });
            }
            loadPlans();
            resetForm();
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Error saving plan');
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price.toString(),
            description: plan.description || '',
            features: plan.features ? plan.features.join('\n') : '',
            active: plan.active,
            best_value: plan.best_value || false,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await adminApi.plans.delete(id);
                loadPlans();
            } catch (error) {
                console.error('Error deleting plan:', error);
                alert('Error deleting plan');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            description: '',
            features: '',
            active: true,
            best_value: false,
        });
        setEditingPlan(null);
        setShowModal(false);
    };

    const openCreateModal = () => {
        setFormData({ name: '', price: '', description: '', features: '', active: true, best_value: false });
        setEditingPlan(null);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <Sidebar />
                <main className="lg:ml-64 pt-24 min-h-screen">
                    <div className="flex items-center justify-center h-96">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                            <span className="text-white/60">Loading plans...</span>
                        </div>
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
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                    Manage Plans
                                </h1>
                                <p className="mt-2 text-white/60">Create and edit pricing plans that users can purchase via PayPal.</p>
                            </div>
                            <Button
                                onClick={openCreateModal}
                                className="flex items-center gap-2 shrink-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Plan
                            </Button>
                        </div>

                        {/* Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {plans.length === 0 ? (
                                <Card className="md:col-span-2 xl:col-span-3 py-16 text-center">
                                    <div className="max-w-md mx-auto">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-2">No plans yet</h3>
                                        <p className="text-white/60 mb-6">Create your first plan to start selling.</p>
                                        <Button onClick={openCreateModal}>Create Plan</Button>
                                    </div>
                                </Card>
                            ) : (
                                plans.map((plan) => (
                                    <Card key={plan.id} className="flex flex-col">
                                        <div className="flex justify-between items-start gap-4 mb-4">
                                            <div className="min-w-0">
                                                <h3 className="text-xl font-bold text-white truncate">{plan.name}</h3>
                                                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent mt-1">
                                                    ${plan.price}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-1.5 items-end shrink-0">
                                                {plan.best_value && (
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                        Best Value
                                                    </span>
                                                )}
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        plan.active
                                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                            : 'bg-white/10 text-white/60 border border-white/10'
                                                    }`}
                                                >
                                                    {plan.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        {plan.description && (
                                            <p className="text-white/60 text-sm mb-4 line-clamp-2">{plan.description}</p>
                                        )}
                                        {plan.features?.length > 0 && (
                                            <ul className="space-y-2 mb-4 flex-1">
                                                {plan.features.slice(0, 3).map((f, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                                                        <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        {f}
                                                    </li>
                                                ))}
                                                {plan.features.length > 3 && (
                                                    <li className="text-xs text-white/50">+{plan.features.length - 3} more</li>
                                                )}
                                            </ul>
                                        )}
                                        <div className="flex gap-2 pt-4 border-t border-white/10">
                                            <Button variant="secondary" onClick={() => handleEdit(plan)} className="flex-1 text-sm py-2">
                                                Edit
                                            </Button>
                                            <Button variant="danger" onClick={() => handleDelete(plan.id)} className="flex-1 text-sm py-2">
                                                Delete
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={resetForm} />
                    <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-gray-900/95 backdrop-blur">
                            <h2 className="text-xl font-bold text-white">
                                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <Input
                                label="Plan Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Premium 🏆"
                                required
                            />
                            <Input
                                label="Price (USD)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-white/40"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the plan"
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-white/90 mb-2">
                                    Features <span className="text-white/50 font-normal">(one per line)</span>
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-white/40"
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    placeholder={'Feature 1\nFeature 2\nFeature 3'}
                                    rows="5"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                                    />
                                    <span className="text-white/90">Active (visible to users)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.best_value}
                                        onChange={(e) => setFormData({ ...formData, best_value: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
                                    />
                                    <span className="text-white/90 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Best Value (show badge on pricing page)
                                    </span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" className="flex-1">
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
