import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Button from '../components/Button';
import { authApi } from '../api/auth';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }

        if (!token || !email) {
            setError('Invalid reset link. Please request a new one.');
            return;
        }

        setLoading(true);

        try {
            await authApi.resetPassword({ token, email, password, password_confirmation: passwordConfirmation });
            setMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
                        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Reset Password</h2>
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
                            label="New Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
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