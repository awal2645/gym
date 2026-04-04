import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifPermission, setNotifPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
    const dropdownRef = useRef(null);

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) return;
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
    };

    const testNotification = () => {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        const title = 'JS Fitness';
        const body = 'Test notification - if you see this, notifications work!';
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(title, { body, tag: 'test' });
            }).catch(() => {
                new Notification(title, { body });
            });
        } else {
            new Notification(title, { body });
        }
    };

    const playTone = () => {
        const audio = new Audio('/tone.mp3');
        audio.currentTime = 0;
        audio.play().catch((err) => {
            console.log('Audio play blocked or failed:', err);
        });
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        setShowDropdown(false);
        logout();
        navigate('/login', { replace: true });
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const getProfilePictureUrl = () => {
        if (user?.profile_picture_url) {
            return user.profile_picture_url;
        }
        return null;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24 py-2">
                    <div className="flex items-center">
                    <Link
                            to="https://www.joeyspeakesfitness.com/" target="_blank"
                            className="flex items-center gap-3 font-bold text-xl tracking-tight group"
                        >   <img
                                src="https://static.wixstatic.com/media/043e76_bf25043294364c059b4a1b246c029c2d~mv2.png/v1/fill/w_168,h_180,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/zColor%20-%20White_1500px.png"
                                alt="JS Fitness Form Checker"
                                className="h-20 w-auto group-hover:scale-110 transition-transform duration-300"
                                style={{ scale: 1.5 }}
                            /></Link>   
                    
                        <Link
                            to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/chat') : '/login'}
                            className="flex items-center gap-3 font-bold text-xl tracking-tight group"
                        >
                            
                               <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                                JS Fitness Form Checker
                            </span>
                           
                        </Link>
                     
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="text-white/70 hover:text-white transition-colors duration-200">
                                        Admin
                                    </Link>
                                )}
                                
                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors duration-200"
                                    >
                                        <div className="text-right hidden sm:block">
                                            <div className="text-sm font-semibold text-white">{user?.name}</div>
                                            <div className="text-xs text-white/60">{user?.email}</div>
                                        </div>
                                        <div className="relative">
                                            {getProfilePictureUrl() ? (
                                                <img
                                                    src={getProfilePictureUrl()}
                                                    alt={user?.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold border-2 border-white/20">
                                                    {getInitials(user?.name)}
                                                </div>
                                            )}
                                        </div>
                                        <svg
                                            className={`w-4 h-4 text-white/60 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden">
                                            <div className="py-1">
                                                {('Notification' in window) && notifPermission !== 'granted' && (
                                                    <button
                                                        onClick={requestNotificationPermission}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-amber-400 hover:bg-white/5 hover:text-amber-300 transition-colors duration-200"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                        </svg>
                                                        <span>Enable notifications</span>
                                                    </button>
                                                )}
                                                {('Notification' in window) && notifPermission === 'granted' && (
                                                    <button
                                                        onClick={() => { setShowDropdown(false); testNotification(); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white transition-colors duration-200"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                        </svg>
                                                        <span>Test notification</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={playTone}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white transition-colors duration-200"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-.661A1 1 0 0121 10.329v3.342a1 1 0 01-1.447.99L15 14m-6 0l-4.553.661A1 1 0 013 13.671v-3.342a1 1 0 011.447-.99L9 10m0 4v-4a3 3 0 016 0v4" />
                                                    </svg>
                                                    <span>Test sound</span>
                                                </button>
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setShowDropdown(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white transition-colors duration-200"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>Profile</span>
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white transition-colors duration-200"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="secondary">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button>Get Started</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}