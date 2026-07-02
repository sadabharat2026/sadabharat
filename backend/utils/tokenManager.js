const axios = require('axios');

class TokenManager {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.isFetching = false;
    this.fetchPromise = null;
  }

  async getToken() {
    // If token exists and is valid for at least another 5 minutes (300000 ms), return it
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
      return this.token;
    }

    // If a fetch is already in progress, wait for it to finish
    if (this.isFetching) {
      return this.fetchPromise;
    }

    // Otherwise, fetch a new token
    this.isFetching = true;
    this.fetchPromise = this._fetchNewToken();
    
    try {
      const token = await this.fetchPromise;
      return token;
    } finally {
      this.isFetching = false;
      this.fetchPromise = null;
    }
  }

  async _fetchNewToken() {
    try {
      const email = process.env.SHIPROCKET_EMAIL;
      const password = process.env.SHIPROCKET_PASSWORD;
      const baseUrl = process.env.SHIPROCKET_BASE_URL;

      if (!email || !password || !baseUrl) {
        throw new Error('Shiprocket credentials are not configured in environment variables');
      }

      const response = await axios.post(`${baseUrl}/auth/login`, {
        email,
        password
      });

      this.token = response.data.token;
      // Shiprocket token is usually valid for 10 days, but we can set a conservative expiry of 9 days (or parse the JWT)
      // Let's assume 9 days (9 * 24 * 60 * 60 * 1000) for safety if expiry isn't provided.
      // But actually, we can decode the JWT to get exact expiry if needed. Since we don't have jwt-decode, 9 days is safe.
      this.tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000); 

      console.log('Successfully fetched new Shiprocket token');
      return this.token;
    } catch (error) {
      console.error('Failed to fetch Shiprocket token:', error.response?.data || error.message);
      this.token = null;
      this.tokenExpiry = null;
      throw new Error('Could not authenticate with Shiprocket');
    }
  }

  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
  }
}

// Export as a singleton
const tokenManager = new TokenManager();
module.exports = tokenManager;
