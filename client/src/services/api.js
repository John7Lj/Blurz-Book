import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url); // Debug log
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log('API Error:', {
      status: error.response?.status,
      url: originalRequest?.url,
      retry: originalRequest?._retry
    }); // Debug log

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        console.log('Attempting token refresh, has refresh token:', !!refreshToken); // Debug log
        
        if (refreshToken) {
          // Create a new axios instance without interceptors for refresh request
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh_token`,
            { refresh_token: refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`
              }
            }
          );

          console.log('Refresh response:', refreshResponse.data); // Debug log

          const { access_token } = refreshResponse.data;
          
          if (!access_token) {
            throw new Error('No access token in refresh response');
          }
          
          localStorage.setItem('access_token', access_token);
          console.log('New access token stored'); // Debug log

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } else {
          console.log('No refresh token available'); // Debug log
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError); // Debug log
        // Refresh failed, logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 errors (email not verified)
    if (error.response?.status === 403) {
      const detail = error.response?.data?.detail;
      if (detail) {
        if (typeof detail === 'object' && detail.message) {
          error.userMessage = detail.message;
        } else if (typeof detail === 'string' && (detail.includes('verify') || detail.includes('verification'))) {
          error.userMessage = 'Please verify your email before continuing. Check your inbox!';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;