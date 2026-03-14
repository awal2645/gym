import api from './axios';

export const checkoutApi = {
    createOrder: (data) => api.post('/checkout/create-order', data),
    captureOrder: (data) => api.post('/checkout/capture-order', data),
};
