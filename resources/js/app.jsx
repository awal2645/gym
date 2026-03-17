// Suppress Fast Refresh preamble errors globally
if (typeof window !== 'undefined') {
    const originalError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
        if (message?.includes?.('@vitejs/plugin-react') && message?.includes?.('preamble')) {
            return true; // Suppress error
        }
        if (originalError) {
            return originalError.call(this, message, source, lineno, colno, error);
        }
        return false;
    };
    
    window.addEventListener('error', (event) => {
        if (event.message?.includes?.('@vitejs/plugin-react') && event.message?.includes?.('preamble')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return false;
        }
    }, true);
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import PricingPage from './pages/PricingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Account from './pages/Account';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlans from './pages/admin/AdminPlans';
import AdminPurchases from './pages/admin/AdminPurchases';
import AdminChat from './pages/admin/AdminChat';
import '../css/app.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                        <p className="text-gray-700 mb-4">{this.state.error?.message || 'An error occurred'}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Reload Page
                        </button>
                        <details className="mt-4 text-left">
                            <summary className="cursor-pointer text-sm text-gray-600">Error Details</summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {this.state.error?.stack}
                            </pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-lg text-white/60">Loading...</div>
                </div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route
                        path="/login"
                        element={
                            <GuestRoute>
                                <Login />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <GuestRoute>
                                <Register />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/forgot-password"
                        element={
                            <GuestRoute>
                                <ForgotPassword />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/reset-password"
                        element={
                            <GuestRoute>
                                <ResetPassword />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/checkout/:planId"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
                                <Chat />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/account"
                        element={
                            <ProtectedRoute>
                                <Account />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/plans"
                        element={
                            <AdminRoute>
                                <AdminPlans />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/purchases"
                        element={
                            <AdminRoute>
                                <AdminPurchases />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/chat"
                        element={
                            <AdminRoute>
                                <AdminChat />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </ErrorBoundary>
    );
}

// Suppress Fast Refresh errors for context files
if (import.meta.hot) {
    import.meta.hot.on('vite:reactFastRefresh', (payload) => {
        if (payload.file?.includes('AuthContext')) {
            return; // Ignore Fast Refresh errors for AuthContext
        }
    });
}

// Initialize React App
function initApp() {
    const container = document.getElementById('app');
    
    if (!container) {
        console.error('❌ App container not found! Make sure <div id="app"></div> exists in welcome.blade.php');
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: sans-serif;">
                <h1 style="color: red;">Error: App container not found</h1>
                <p>Make sure <code>&lt;div id="app"&gt;&lt;/div&gt;</code> exists in welcome.blade.php</p>
            </div>
        `;
        return;
    }

    console.log('✅ App container found, initializing React...');
    
    // Suppress Fast Refresh preamble errors
    window.addEventListener('error', (event) => {
        if (event.message?.includes('@vitejs/plugin-react') && event.message?.includes('preamble')) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);
    
    const originalError = console.error;
    console.error = function(...args) {
        const message = args[0]?.toString?.() || '';
        if (message.includes('@vitejs/plugin-react') && message.includes('preamble')) {
            return; // Silently ignore
        }
        originalError.apply(console, args);
    };
    
    try {
        const root = createRoot(container);
        
        root.render(
            <React.StrictMode>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </React.StrictMode>
        );
        
        console.log('✅ React app initialized successfully!');
    } catch (error) {
        console.error('❌ Error initializing React app:', error);
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: sans-serif;">
                <h1 style="color: red;">Error Initializing React</h1>
                <p>${error.message}</p>
                <pre style="text-align: left; background: #f5f5f5; padding: 10px; margin-top: 10px; overflow: auto;">
${error.stack}
                </pre>
            </div>
        `;
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
