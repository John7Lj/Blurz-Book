import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://john17.tail4a2d71.ts.net:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Adding token to request:', config.url);
        }

        // Don't set Content-Type for FormData - let axios handle it
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
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
        });

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                console.log('Attempting token refresh, has refresh token:', !!refreshToken);

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

                    console.log('Refresh response:', refreshResponse.data);

                    const { access_token } = refreshResponse.data;

                    if (!access_token) {
                        throw new Error('No access token in refresh response');
                    }

                    await AsyncStorage.setItem('access_token', access_token);
                    console.log('New access token stored');

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                } else {
                    console.log('No refresh token available');
                    throw new Error('No refresh token available');
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Refresh failed, logout user
                await AsyncStorage.clear();
                // Note: Navigation to login should be handled by the app
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
