import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { user } = await register(name, email, password, passwordConfirmation);
            navigate(user?.role === 'admin' ? '/admin' : '/chat');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                const firstError = Object.values(errors)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            }
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
                        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Create Account</h2>
                        <p className="mt-2 text-center text-white/60">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">
                                Login here
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
                            label="Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
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
                        <Input
                            label="Confirm Password"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            showPasswordToggle
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating account...' : 'Register'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}