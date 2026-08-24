const axios = require('axios');

const dtdcApi = axios.create({
  baseURL: process.env.DTDC_BASE_URL || 'https://dtdcapi.dtdc.com/dtdc-api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

dtdcApi.interceptors.request.use((config) => {
  if (process.env.DTDC_API_KEY) {
    config.headers['api-key'] = process.env.DTDC_API_KEY;
  }
  if (process.env.DTDC_ACCESS_TOKEN) {
    config.headers['x-access-token'] = process.env.DTDC_ACCESS_TOKEN;
  }
  return config;
});

const dtdcTrackApi = axios.create({
  baseURL: process.env.DTDC_TRACK_URL || 'https://blktracksvc.dtdc.com/dtdc-api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

dtdcTrackApi.interceptors.request.use((config) => {
  if (process.env.DTDC_ACCESS_TOKEN) {
    config.headers['x-access-token'] = process.env.DTDC_ACCESS_TOKEN;
  }
  if (process.env.DTDC_API_KEY) {
    config.headers['api-key'] = process.env.DTDC_API_KEY;
  }
  return config;
});

module.exports = { dtdcApi, dtdcTrackApi };
