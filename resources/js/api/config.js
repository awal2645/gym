import api from './axios';

export const configApi = {
    getPaypal: () => api.get('/config/paypal'),
};
