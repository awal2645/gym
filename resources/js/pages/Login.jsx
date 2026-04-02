import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [tempToken, setTempToken] = useState(null);
    const { login, complete2faLogin } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);
            if (data.requires_2fa && data.temp_token) {
                setTempToken(data.temp_token);
                setCode('');
                return;
            }
            const { user } = data;
            navigate(redirect || (user?.role === 'admin' ? '/admin' : '/chat'));
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.code?.[0];
            setError(msg || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handle2faSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { user } = await complete2faLogin(tempToken, code);
            navigate(redirect || (user?.role === 'admin' ? '/admin' : '/chat'));
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.code?.[0];
            setError(msg || 'Invalid code. Please try again.');
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
                            <Link
                                to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
                                className="text-blue-400 hover:text-blue-300 underline"
                            >
                                Register here
                            </Link>
                        </p>
                    </div>
                    {tempToken ? (
                        <form className="mt-8 space-y-6" onSubmit={handle2faSubmit}>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}
                            <p className="text-white/70 text-sm text-center">
                                Enter the 6-digit code from your authenticator app
                            </p>
                            <Input
                                label="Verification Code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1" disabled={loading || code.length !== 6}>
                                    {loading ? 'Verifying...' : 'Verify'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => { setTempToken(null); setError(''); }}
                                >
                                    Back
                                </Button>
                            </div>
                        </form>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}