import api from './axios';

export const adminApi = {
    plans: {
        getAll: () => api.get('/admin/plans'),
        create: (data) => api.post('/admin/plans', data),
        update: (id, data) => api.put(`/admin/plans/${id}`, data),
        delete: (id) => api.delete(`/admin/plans/${id}`),
    },
    purchases: {
        getAll: () => api.get('/admin/purchases'),
    },
    chat: {
        getUsers: () => api.get('/admin/chat/users'),
        getMessages: (userId) => api.get(`/admin/chat/messages/${userId}`),
        sendMessage: (userId, data, onUploadProgress) => {
            // If data contains a file, use FormData
            if (data instanceof FormData) {
                return api.post(`/admin/chat/messages/${userId}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (onUploadProgress && progressEvent.total) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onUploadProgress(percentCompleted, progressEvent.loaded, progressEvent.total);
                        }
                    },
                });
            }
            return api.post(`/admin/chat/messages/${userId}`, data);
        },
    },
};
