import api from './axios';

export const purchasesApi = {
    getMyPurchases: () => api.get('/purchases/me'),
};
