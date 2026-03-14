import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import VideoPlayer from '../../components/VideoPlayer';
import VideoModal from '../../components/VideoModal';
import { adminApi } from '../../api/admin';
import { getPusherInstance } from '../../utils/pusher';
import api from '../../api/axios';
import { compressImage, uploadFileDirectly, optimizedFileUpload, CHUNK_THRESHOLD } from '../../utils/fileUpload';

/** Treat as image if file_type says so or filename has image extension (for generic types from large uploads). */
function isMessageImage(message) {
    if (message.file_type?.startsWith('image/')) return true;
    const ext = (message.file_name || '').split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
}

/** Treat as video if file_type says so or filename has video extension (for generic types from large uploads). */
function isMessageVideo(message) {
    if (message.file_type?.startsWith('video/')) return true;
    const ext = (message.file_name || '').split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'webm', 'mkv', 'mov', 'avi', 'm4v', 'ogv', '3gp'].includes(ext);
}

export default function AdminChat() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [filePreviewType, setFilePreviewType] = useState(null); // 'image', 'video', or null
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pusherRef = useRef(null);
    const channelRef = useRef(null);
    const fileInputRef = useRef(null);
    const selectedUserRef = useRef(selectedUser);
    const reminderTimersRef = useRef([]);
    const [videoModal, setVideoModal] = useState(null);
    selectedUserRef.current = selectedUser;

    const notifyIncomingMessage = (msg) => {
        try {
            const audio = new Audio('/tone.mp3');
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch {
            // ignore audio errors
        }

        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                const fromName = msg.from_user?.name || 'New message';
                const body = msg.body || (msg.file_name ? `📎 ${msg.file_name}` : 'New chat message');
                new Notification(`Message from ${fromName}`, {
                    body,
                    requireInteraction: true,
                });
            }
        } catch {
            // ignore notification errors
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        return () => {
            reminderTimersRef.current.forEach(clearTimeout);
            reminderTimersRef.current = [];
        };
    }, []);

    useEffect(() => {
        if (selectedUser) {
            setMessages([]);
            setHasMoreMessages(false);
            loadMessages(selectedUser.id);
        }
    }, [selectedUser]);

    useEffect(() => {
        const pusher = getPusherInstance();
        if (!pusher) return;

        try {
            const adminChannel = pusher.subscribe('private-chat.admin');

            adminChannel.bind('message.sent', (data) => {
                console.log('[AdminChat] message.sent event', data);
                const msg = data.message;
                const currentSelected = selectedUserRef.current;
                // Update messages if viewing this conversation
                if (currentSelected && (msg.from_user_id === currentSelected.id || msg.to_user_id === currentSelected.id)) {
                    setMessages((prev) => {
                        const exists = prev.some((m) => m.id === msg.id);
                        if (exists) return prev;
                        return [...prev, msg];
                    });
                }

                // Only notify when message is from someone else
                if (msg.from_user_id !== user.id) {
                    notifyIncomingMessage(msg);
                }
            });

            channelRef.current = adminChannel;
            pusherRef.current = pusher;

            return () => {
                if (channelRef.current) {
                    channelRef.current.unbind('message.sent');
                    pusher.unsubscribe('private-chat.admin');
                }
            };
        } catch (error) {
            console.error('Error subscribing to Pusher channel:', error);
        }
    }, [user?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadUsers = () => {
        adminApi.chat.getUsers()
            .then((response) => {
                setUsers(response.data.users || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error loading users:', error);
                setLoading(false);
            });
    };

    const loadMessages = (userId) => {
        adminApi.chat.getMessages(userId, { limit: 10 })
            .then((response) => {
                setMessages(response.data.messages || []);
                setHasMoreMessages(response.data.has_more ?? false);
            })
            .catch((error) => {
                console.error('Error loading messages:', error);
            });
    };

    const loadMoreMessages = () => {
        if (!selectedUser || loadingMore || !hasMoreMessages || messages.length === 0) return;
        const oldestId = messages[0].id;
        setLoadingMore(true);
        adminApi.chat.getMessages(selectedUser.id, { limit: 10, before_id: oldestId })
            .then((response) => {
                const older = response.data.messages || [];
                setMessages((prev) => [...older, ...prev]);
                setHasMoreMessages(response.data.has_more ?? false);
            })
            .catch((error) => {
                console.error('Error loading more messages:', error);
            })
            .finally(() => setLoadingMore(false));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create preview for images and videos
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                    setFilePreviewType('image');
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                    setFilePreviewType('video');
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
                setFilePreviewType(null);
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setFilePreviewType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || sending || uploading || !selectedUser) return;

        const hasFile = selectedFile !== null;
        setSending(true);
        if (hasFile) {
            setUploading(true);
            setUploadProgress(0);
        }

        try {
            let fileToUpload = selectedFile;
            if (selectedFile && selectedFile.type.startsWith('image/')) {
                setUploadProgress(5);
                fileToUpload = await compressImage(selectedFile, 1920, 1080, 0.85);
                setUploadProgress(10);
            }

            const token = localStorage.getItem('token');
            const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
            const baseUrl = api.defaults.baseURL || '';

            let response;
            if (fileToUpload && fileToUpload.size > CHUNK_THRESHOLD) {
                const chunkedUrl = `${baseUrl}/admin/chat/upload/${selectedUser.id}`;
                response = await optimizedFileUpload(
                    fileToUpload,
                    chunkedUrl,
                    {
                        useChunking: true,
                        onProgress: (percent) => setUploadProgress(10 + Math.round(percent * 0.9)),
                        headers: authHeaders,
                        initPayload: { body: newMessage.trim() || '' },
                    }
                );
            } else {
                const formData = new FormData();
                if (newMessage.trim()) formData.append('body', newMessage);
                if (fileToUpload) formData.append('file', fileToUpload);
                response = await uploadFileDirectly(
                    formData,
                    `/admin/chat/messages/${selectedUser.id}`,
                    { Accept: 'application/json', ...authHeaders },
                    (percent) => setUploadProgress(10 + Math.round(percent * 0.9))
                );
            }

            setMessages((prev) => [...prev, response]);
            setNewMessage('');
            setSelectedFile(null);
            setFilePreview(null);
            setFilePreviewType(null);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            loadUsers(); // Refresh unread counts
            // Frontend: trigger reminder email after 1 min if no reply
            const timerId = setTimeout(() => {
                adminApi.chat.triggerReminder(response.id)
                    .then((res) => { if (res?.data?.sent) console.log('[AdminChat] Reminder email triggered'); })
                    .catch((err) => console.warn('[AdminChat] Reminder trigger failed:', err?.response?.data || err.message));
            }, 60000);
            reminderTimersRef.current.push(timerId);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message. Please try again.');
        } finally {
            setSending(false);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const getProfilePictureUrl = (user) => {
        return user?.profile_picture_url || null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navbar />
                <div className="flex items-center justify-center min-h-[50vh] pt-24 sm:pt-32">
                    <div className="text-base sm:text-lg text-white/60">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col py-5">
            <Navbar />
            <div className="flex-1 flex flex-col min-h-0 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-4 sm:pb-6">
                <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4 shrink-0 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Chat with Joey - Upload Your Video & Message</h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 flex-1 min-h-0">
                    <div className={selectedUser ? 'hidden lg:block' : undefined}>
                        <Card className="p-4">
                            <h2 className="text-lg sm:text-xl font-bold mb-2 text-white">Clients</h2>
                            <div className="space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto">
                            {users.map((u) => {
                                const profilePicUrl = getProfilePictureUrl(u);
                                return (
                                    <button
                                        key={u.id}
                                        onClick={() => setSelectedUser(u)}
                                        className={`w-full text-left px-2.5 py-2 rounded-lg transition-all duration-200 ${
                                            selectedUser?.id === u.id
                                                ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/30 border border-blue-500/50'
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-shrink-0">
                                                {profilePicUrl ? (
                                                    <img
                                                        src={profilePicUrl}
                                                        alt={u.name}
                                                        className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold border-2 border-white/20">
                                                        {getInitials(u.name)}
                                                    </div>
                                                )}
                                                {u.unread_count > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[14px] h-3.5 px-1 flex items-center justify-center font-bold border border-black">
                                                        {u.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-white text-sm truncate">{u.name}</p>
                                                {u.last_message && (
                                                    <p className="text-[11px] text-white/50 truncate">
                                                        {u.last_message.body || (u.last_message.file_name ? `📎 ${u.last_message.file_name}` : 'File')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                            </div>
                        </Card>
                    </div>

                    <div className={`${!selectedUser ? 'hidden lg:flex' : 'flex'} flex-col min-h-0 lg:col-span-2`}>
                        {selectedUser ? (
                            <Card className="flex flex-col flex-1 min-h-0 p-0 overflow-hidden">
                                <div className="shrink-0 mb-3 sm:mb-4 pb-3 sm:pb-4 px-6 pt-6 border-b border-white/10">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUser(null)}
                                            className="lg:hidden shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors touch-manipulation"
                                            aria-label="Back to users"
                                        >
                                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        {getProfilePictureUrl(selectedUser) ? (
                                            <img
                                                src={getProfilePictureUrl(selectedUser)}
                                                alt={selectedUser.name}
                                                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full object-cover border-2 border-white/20 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm sm:text-lg lg:text-2xl font-bold border-2 border-white/20 shrink-0">
                                                {getInitials(selectedUser.name)}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">{selectedUser.name}</h2>
                                            <p className="text-xs sm:text-sm text-white/60 truncate">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-white/50 py-8">
                                            No messages yet.
                                        </div>
                                    ) : (
                                        <>
                                        {hasMoreMessages && (
                                            <div className="flex justify-center py-3">
                                                <button
                                                    type="button"
                                                    onClick={loadMoreMessages}
                                                    disabled={loadingMore}
                                                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {loadingMore ? 'Loading...' : 'Load more'}
                                                </button>
                                            </div>
                                        )}
                                        {messages.map((message) => {
                                            const isOwn = message.from_user_id === user.id;
                                            const senderPicUrl = message.from_user?.profile_picture_url;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {!isOwn && (
                                                        <div className="flex-shrink-0">
                                                            {senderPicUrl ? (
                                                                <img
                                                                    src={senderPicUrl}
                                                                    alt={message.from_user?.name}
                                                                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border border-white/20">
                                                                    {getInitials(message.from_user?.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`max-w-[85vw] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl ${
                                                            isOwn
                                                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                                                                : 'bg-white/5 text-white border border-white/10'
                                                        }`}
                                                    >
                                                        <p className="text-sm font-semibold mb-1">
                                                            {message.from_user?.name || 'User'}
                                                        </p>
                                                        {message.body && (
                                                            <p className="text-white/90 mb-2">{message.body}</p>
                                                        )}
                                                        {message.file_path && (
                                                            <div className="mb-2 rounded-xl overflow-hidden bg-black/20">
                                                                {isMessageImage(message) ? (
                                                                    <a
                                                                        href={message.file_url || `/storage/${message.file_path}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block rounded-lg overflow-hidden"
                                                                    >
                                                                        <img
                                                                            src={message.file_url || `/storage/${message.file_path}`}
                                                                            alt={message.file_name || 'Image'}
                                                                            loading="lazy"
                                                                            className="max-w-full max-h-72 w-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                                                                        />
                                                                    </a>
                                                                ) : isMessageVideo(message) ? (
                                                                    <div
                                                                        className="relative rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                                                                        onClick={() => setVideoModal({
                                                                            src: message.file_url || `/storage/${message.file_path}`,
                                                                            embedUrl: message.file_embed_url,
                                                                            title: message.file_name || 'Video',
                                                                        })}
                                                                    >
                                                                        {message.file_embed_url ? (
                                                                            <iframe
                                                                                src={message.file_embed_url}
                                                                                title={message.file_name || 'Video'}
                                                                                className="w-full aspect-video max-h-72 rounded-xl bg-black pointer-events-none"
                                                                                allow="autoplay; fullscreen"
                                                                                allowFullScreen
                                                                            />
                                                                        ) : (
                                                                            <VideoPlayer
                                                                                src={message.file_url || `/storage/${message.file_path}`}
                                                                                className="w-full aspect-video max-h-72 rounded-xl"
                                                                                previewOnly
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <a
                                                                        href={message.file_url || `/storage/${message.file_path}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                                                    >
                                                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                        </svg>
                                                                        <span className="text-sm truncate">{message.file_name || 'Download file'}</span>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-white/50'}`}>
                                                            {new Date(message.created_at).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    {isOwn && (
                                                        <div className="flex-shrink-0">
                                                            {user?.profile_picture_url ? (
                                                                <img
                                                                    src={user.profile_picture_url}
                                                                    alt={user.name}
                                                                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border border-white/20">
                                                                    {getInitials(user?.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                        }
                                    </>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {selectedFile && (
                                    <div className="shrink-0 flex justify-end mb-3 px-6">
                                        <div className="max-w-[85vw] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white border-2 border-blue-400/50 shadow-lg">
                                            <p className="text-sm font-semibold mb-2 opacity-90">Preview</p>
                                            {filePreviewType === 'video' ? (
                                                <div className="rounded-lg overflow-hidden bg-black/30 mb-2">
                                                    <VideoPlayer
                                                        src={filePreview}
                                                        className="w-full aspect-video max-h-48"
                                                        autoPlay={false}
                                                    />
                                                </div>
                                            ) : filePreviewType === 'image' ? (
                                                <div className="rounded-lg overflow-hidden mb-2 ring-2 ring-white/20">
                                                    <img src={filePreview} alt="Preview" className="max-w-full max-h-48 w-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 py-2 mb-2">
                                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                                        <p className="text-xs opacity-80">{formatFileSize(selectedFile.size)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between gap-2">
                                                {uploading ? (
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs">Uploading...</span>
                                                            <span className="text-xs font-semibold">{uploadProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-white h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${uploadProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs opacity-90 truncate flex-1">{selectedFile.name}</p>
                                                )}
                                                {!uploading && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
                                                        title="Remove"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="shrink-0 border-t border-white/10 px-4 sm:px-6 py-4 bg-black/30">
                                <form onSubmit={handleSend} className="flex gap-1.5 sm:gap-2 flex-nowrap">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="admin-file-input"
                                        accept="*/*"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="admin-file-input"
                                        className="shrink-0 w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-3 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer touch-manipulation"
                                    >
                                        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </label>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="min-w-0 flex-1 w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-white/40 text-base"
                                        disabled={sending}
                                    />
                                    <Button type="submit" className="shrink-0 min-h-[2.5rem] sm:min-h-0 px-4 sm:px-6" disabled={sending || uploading || (!newMessage.trim() && !selectedFile)}>
                                        {uploading ? `Uploading ${uploadProgress}%...` : sending ? 'Sending...' : 'Send'}
                                    </Button>
                                </form>
                                </div>
                            </Card>
                        ) : (
                            <Card>
                                <div className="text-center text-white/50 py-8 sm:py-12 text-sm sm:text-base">
                                    Select a client to start chatting
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {videoModal && (
                <VideoModal
                    isOpen={!!videoModal}
                    onClose={() => setVideoModal(null)}
                    src={videoModal.embedUrl ? null : videoModal.src}
                    embedUrl={videoModal.embedUrl}
                    title={videoModal.title}
                />
            )}
        </div>
    );
}