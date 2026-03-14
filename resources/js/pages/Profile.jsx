import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPreviewUrl(user.profile_picture_url || null);
        }
    }, [user]);

    useEffect(() => {
        const googleConnected = searchParams.get('google_connected');
        const googleError = searchParams.get('google_error');
        if (googleConnected === '1') {
            setSuccess('Google Drive connected successfully. Chat videos will upload to your Drive.');
            refreshUser();
            setSearchParams({}, { replace: true });
            setTimeout(() => setSuccess(''), 5000);
        }
        if (googleError) {
            setError('Google Drive connection failed: ' + decodeURIComponent(googleError));
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, refreshUser, setSearchParams]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size must be less than 2MB');
                return;
            }
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authApi.updateProfile({ name, email });
            setSuccess('Profile updated successfully!');
            // Refresh user data
            await refreshUser();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                const firstError = Object.values(errors)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePictureUpload = async () => {
        if (!profilePicture) return;

        setError('');
        setSuccess('');
        setUploading(true);

        try {
            const response = await authApi.uploadProfilePicture(profilePicture);
            setSuccess('Profile picture uploaded successfully!');
            setProfilePicture(null);
            // Refresh user data
            const updatedUser = await refreshUser();
            setPreviewUrl(updatedUser?.profile_picture_url || null);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload profile picture. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const handleConnectGoogle = async () => {
        setGoogleLoading(true);
        setError('');
        try {
            const { data } = await authApi.getGoogleRedirectUrl();
            if (data?.url) window.location.href = data.url;
            else setError('Could not get Google sign-in URL.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to connect Google Drive.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleDisconnectGoogle = async () => {
        setError('');
        try {
            await authApi.disconnectGoogle();
            setSuccess('Google Drive disconnected.');
            await refreshUser();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disconnect.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <Sidebar />
            <main className="lg:ml-64 pt-24 min-h-screen">
                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Profile Settings</h1>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl mb-6">
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Profile Picture Section */}
                            <Card>
                                <h2 className="text-2xl font-bold mb-4 text-white">Profile Picture</h2>
                                <div className="flex flex-col items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="profile-picture-input"
                                    />
                                    <label
                                        htmlFor="profile-picture-input"
                                        className="relative block cursor-pointer group mb-4"
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt={user?.name}
                                                className="w-32 h-32 rounded-full object-cover border-4 border-white/20 group-hover:opacity-90 transition-opacity"
                                            />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20 group-hover:opacity-90 transition-opacity">
                                                {getInitials(user?.name)}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H20a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </label>
                                    <p className="text-sm text-white/70 mb-3 text-center">Click photo to update</p>
                                    {profilePicture && (
                                        <div className="flex flex-col gap-2 w-full">
                                            <Button
                                                onClick={handlePictureUpload}
                                                disabled={uploading}
                                                className="w-full"
                                            >
                                                {uploading ? 'Uploading...' : 'Save New Picture'}
                                            </Button>
                                            <button
                                                type="button"
                                                onClick={() => { setProfilePicture(null); setPreviewUrl(user?.profile_picture_url || null); }}
                                                className="text-sm text-white/50 hover:text-white/80 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-xs text-white/50 mt-2 text-center">
                                        JPG, PNG or GIF. Max 2MB
                                    </p>
                                </div>
                            </Card>

                            {/* Google Drive Section */}
                            {/* <Card>
                                <h2 className="text-2xl font-bold mb-4 text-white">Google Drive</h2>
                                <p className="text-white/70 text-sm mb-4">
                                    Connect your Google account to upload chat videos to your Drive instead of the server.
                                </p>
                                {user?.google_drive_connected ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400 text-sm font-medium">Connected</span>
                                        <Button type="button" variant="secondary" onClick={handleDisconnectGoogle} className="text-sm">
                                            Disconnect
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleConnectGoogle}
                                        disabled={googleLoading}
                                        className="w-full inline-flex items-center justify-center gap-2"
                                    >
                                        {googleLoading ? 'Redirecting...' : (
                                            <>
                                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                                Connect Google Drive
                                            </>
                                        )}
                                    </Button>
                                )}
                            </Card> */}

                            {/* Profile Details Section */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <h2 className="text-2xl font-bold mb-4 text-white">Profile Details</h2>
                                    <form onSubmit={handleProfileUpdate}>
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
                                        <div className="flex gap-3 mt-6">
                                            <Button type="submit" disabled={loading}>
                                                {loading ? 'Updating...' : 'Update Profile'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => navigate('/dashboard')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}