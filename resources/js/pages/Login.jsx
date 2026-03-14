import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { user } = await login(email, password);
            navigate(redirect || (user?.role === 'admin' ? '/admin' : '/chat'));
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
                        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Login</h2>
                        <p className="mt-2 text-center text-white/60">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 underline">
                                Register here
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            showPasswordToggle
                            required
                        />
                        <div className="flex items-center justify-between">
                            <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}