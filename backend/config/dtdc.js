const axios = require('axios');

const trim = (value) => (value == null ? '' : String(value).trim());

const dtdcApi = axios.create({
  baseURL: trim(process.env.DTDC_BASE_URL) || 'https://dtdcapi.dtdc.com/dtdc-api',
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

dtdcApi.interceptors.request.use((config) => {
  const apiKey = trim(process.env.DTDC_API_KEY);
  const accessToken = trim(process.env.DTDC_ACCESS_TOKEN);
  if (apiKey) config.headers['api-key'] = apiKey;
  if (accessToken) config.headers['x-access-token'] = accessToken;
  return config;
});

const dtdcTrackApi = axios.create({
  baseURL: trim(process.env.DTDC_TRACK_URL) || 'https://blktracksvc.dtdc.com/dtdc-api',
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

dtdcTrackApi.interceptors.request.use((config) => {
  const apiKey = trim(process.env.DTDC_API_KEY);
  const accessToken = trim(process.env.DTDC_ACCESS_TOKEN);
  if (accessToken) config.headers['x-access-token'] = accessToken;
  if (apiKey) config.headers['api-key'] = apiKey;
  return config;
});

module.exports = { dtdcApi, dtdcTrackApi };
