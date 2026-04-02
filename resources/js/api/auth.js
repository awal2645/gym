import api from './axios';

export const authApi = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    logout: () => api.post('/logout'),
    me: () => api.get('/me'),
    forgotPassword: (data) => api.post('/forgot-password', data),
    resetPassword: (data) => api.post('/reset-password', data),
    updateProfile: (data) => api.put('/profile', data),
    updatePassword: (data) => api.put('/profile/password', data),
    uploadProfilePicture: (file) => {
        const formData = new FormData();
        formData.append('profile_picture', file);
        return api.post('/profile/picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getGoogleRedirectUrl: () => api.get('/google/redirect-url'),
    disconnectGoogle: () => api.post('/google/disconnect'),
};
