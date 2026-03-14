import Pusher from 'pusher-js';
import api from '../api/axios';

let pusherInstance = null;

// Get API URL (same logic as axios.js)
const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (window.location.origin !== 'http://localhost:5173' && window.location.origin !== 'http://127.0.0.1:5173') {
        return `${window.location.origin}/api`;
    }
    return 'http://localhost:8000/api';
};

export function getPusherInstance() {
    if (pusherInstance) {
        return pusherInstance;
    }

    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
    const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

    if (!pusherKey || !pusherCluster) {
        console.warn('Pusher credentials not configured');
        return null;
    }

    pusherInstance = new Pusher(pusherKey, {
        cluster: pusherCluster,
        encrypted: true,
        authEndpoint: `${getApiUrl()}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                Accept: 'application/json',
            },
        },
    });

    return pusherInstance;
}

export function disconnectPusher() {
    if (pusherInstance) {
        pusherInstance.disconnect();
        pusherInstance = null;
    }
}