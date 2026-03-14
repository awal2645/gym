import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { adminApi } from '../../api/admin';

export default function AdminPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        features: '',
        active: true,
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
                });
            } else {
                await adminApi.plans.create({
                    ...formData,
                    price: parseFloat(formData.price),
                    features,
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
        });
        setShowForm(true);
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
        });
        setEditingPlan(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-lg">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Manage Plans</h1>
                    <Button onClick={() => setShowForm(true)}>Add New Plan</Button>
                </div>

                {showForm && (
                    <Card className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <Input
                                label="Plan Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Features (one per line)
                                </label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    rows="5"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="flex space-x-4">
                                <Button type="submit">
                                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan.id}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <p className="text-2xl font-bold text-blue-600">${plan.price}</p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs ${
                                        plan.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {plan.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">{plan.description}</p>
                            <div className="flex space-x-2">
                                <Button variant="secondary" onClick={() => handleEdit(plan)} className="flex-1">
                                    Edit
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(plan.id)} className="flex-1">
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
