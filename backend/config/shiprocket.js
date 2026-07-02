const axios = require('axios');
const tokenManager = require('../utils/tokenManager');

const shiprocketApi = axios.create({
  baseURL: process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add the auth token
shiprocketApi.interceptors.request.use(
  async (config) => {
    // We don't need token for the login route itself
    if (!config.url.includes('/auth/login')) {
      const token = await tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration centrally
shiprocketApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 Unauthorized and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;
      
      try {
        // Clear the old token so tokenManager fetches a new one
        tokenManager.clearToken();
        const newToken = await tokenManager.getToken();
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request
        return shiprocketApi(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

module.exports = shiprocketApi;
