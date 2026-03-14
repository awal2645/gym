import api from './axios';

export const chatApi = {
    getConversations: () => api.get('/chat/conversations/me'),
    getMessages: () => api.get('/chat/messages/me'),
    sendMessage: (data, onUploadProgress) => {
        // If data contains a file, use FormData
        if (data instanceof FormData) {
            return api.post('/chat/messages', data, {
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
        return api.post('/chat/messages', data);
    },
};
