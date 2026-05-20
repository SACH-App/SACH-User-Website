// src/utils/api.js

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_URL = baseUrl.replace(/\/+$/, '');

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  let accessToken = localStorage.getItem('sach_access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Do not override Content-Type if it's FormData (browser sets it automatically with boundaries)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(`${API_URL}${endpoint}`, config);

    // If 401 Unauthorized, attempt to refresh the token
    if (response.status === 401 && accessToken) {
      const refreshToken = localStorage.getItem('sach_refresh_token');

      if (!refreshToken) {
        // No refresh token available, force logout
        localStorage.removeItem('sach_access_token');
        localStorage.removeItem('sach_refresh_token');
        window.location.href = '/login';
        return response;
      }

      if (isRefreshing) {
        // Wait for the existing refresh to complete, then retry
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(newToken => {
          config.headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(`${API_URL}${endpoint}`, config);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${API_URL}/api/v1/user/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!refreshRes.ok) {
          throw new Error('Refresh token invalid');
        }

        const data = await refreshRes.json();
        accessToken = data.access_token;
        localStorage.setItem('sach_access_token', accessToken);
        localStorage.setItem('sach_refresh_token', data.refresh_token);

        processQueue(null, accessToken);

        // Retry original request
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        response = await fetch(`${API_URL}${endpoint}`, config);

      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('sach_access_token');
        localStorage.removeItem('sach_refresh_token');
        window.location.href = '/login';
        return response;
      } finally {
        isRefreshing = false;
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};
