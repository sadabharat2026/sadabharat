import axios from 'axios';
import { parseApiError } from './errorHandler';
import { optimizeMediaUrls } from './productImages';

// 1. Create a common Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Adjusted port to 5000
    timeout: 30000, // 30 seconds timeout to accommodate slow external APIs like Razorpay
    headers: {
        'Content-Type': 'application/json',
    }
});

// 2. Request Interceptor (Inject Tokens)
api.interceptors.request.use(
    (config) => {
        // Determine the active scope based on the current URL
        const isAdminScope = window.location.pathname.startsWith('/admin');
        const isVendorScope = window.location.pathname.startsWith('/vendor');

        // Fetch the correct token layer
        let token;
        if (isAdminScope) {
            token = localStorage.getItem('admin_token');
        } else if (isVendorScope) {
            token = localStorage.getItem('vendor_token') || localStorage.getItem('vendor_auth');
        } else {
            token = localStorage.getItem('customer_token');
        }

        // Attach token if available
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor (Global Error Handling Flow)
api.interceptors.response.use(
    (response) => {
        if (response?.data) {
            response.data = optimizeMediaUrls(response.data);
        }
        return response;
    },
    (error) => {
        // Any status code outside the range of 2xx triggers this
        
        // Attach a clean, parsed message to the error object for easy UI consumption
        error.parsedMessage = parseApiError(error);

        // Handle 401 Unauthorized Globally (e.g., token expired)
        if (error.response && error.response.status === 401) {
            const path = typeof window !== 'undefined' ? window.location.pathname : '';
            if (path.startsWith('/admin')) {
                localStorage.removeItem('admin_token');
            } else if (path.startsWith('/vendor')) {
                localStorage.removeItem('vendor_token');
                localStorage.removeItem('vendor_auth');
            } else {
                localStorage.removeItem('customer_token');
            }
        }

        // Handle 403 Forbidden
        if (error.response && error.response.status === 403) {
            console.warn('Forbidden: You do not have access to this resource.');
        }

        // Reject the promise so the specific component can also handle it if needed
        return Promise.reject(error);
    }
);

export default api;
