import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-24 min-h-screen">
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Admin Dashboard</h1>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <h2 className="text-xl font-bold mb-4 text-white">Manage Plans</h2>
                                <p className="text-white/60 mb-4">Create, edit, and manage training plans.</p>
                                <Link to="/admin/plans">
                                    <Button className="w-full">Manage Plans</Button>
                                </Link>
                            </Card>

                            <Card>
                                <h2 className="text-xl font-bold mb-4 text-white">View Purchases</h2>
                                <p className="text-white/60 mb-4">View all customer purchases and orders.</p>
                                <Link to="/admin/purchases">
                                    <Button className="w-full">View Purchases</Button>
                                </Link>
                            </Card>

                            <Card>
                                <h2 className="text-xl font-bold mb-4 text-white">Customer Support</h2>
                                <p className="text-white/60 mb-4">Chat with customers and provide support.</p>
                                <Link to="/admin/chat">
                                    <Button className="w-full">Open Chat</Button>
                                </Link>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}