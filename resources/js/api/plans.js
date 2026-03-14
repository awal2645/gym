import api from './axios';

export const plansApi = {
    getAll: () => api.get('/plans'),
    getById: (id) => api.get(`/plans/${id}`),
};
