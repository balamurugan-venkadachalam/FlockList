import axios from 'axios';

// Initialize axios with default config
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/';
axios.defaults.withCredentials = true;

// Track if a token refresh is in progress
let isRefreshing = false;
// Store failed requests to retry them after token refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
  config: any;
}> = [];

// Process the queued requests
const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach(request => {
    if (error) {
      request.reject(error);
    } else {
      // Update the authorization header
      request.config.headers.Authorization = `Bearer ${token}`;
      request.resolve(axios(request.config));
    }
  });
  
  // Reset the queue
  failedQueue = [];
};

// Add a response interceptor to handle 401 errors
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If there's no original request or response, just reject
    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }
    
    // If it's a 401 unauthorized error and not a refresh token request
    if (
      error.response.status === 401 &&
      originalRequest.url !== '/api/auth/refresh-token' &&
      !originalRequest._retry
    ) {
      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      
      // If we're already refreshing the token, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            config: originalRequest
          });
        });
      }
      
      isRefreshing = true;
      
      try {
        // Try to refresh the token
        const response = await axios.post('/api/auth/refresh-token');
        const { token } = response.data;
        
        // Update token in localStorage
        localStorage.setItem('token', token);
        
        // Update authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update the original request authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Process all the queued requests with the new token
        processQueue(null, token);
        
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // Process the queue with the error
        processQueue(refreshError);
        
        // Remove the token from localStorage
        localStorage.removeItem('token');
        
        // Redirect to login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

// Add a request interceptor to add the token to each request
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axios; 