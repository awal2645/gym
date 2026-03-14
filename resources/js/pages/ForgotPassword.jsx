import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Button from '../components/Button';
import { authApi } from '../api/auth';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await authApi.forgotPassword({ email });
            setMessage('Password reset link has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="flex items-center justify-center py-20 pt-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
                    <div>
                        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Forgot Password</h2>
                        <p className="mt-2 text-center text-white/60">
                            Enter your email and we'll send you a reset link.
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl">
                                {message}
                            </div>
                        )}
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                        <div className="text-center">
                            <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}