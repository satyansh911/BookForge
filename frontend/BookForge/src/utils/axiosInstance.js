import axios from 'axios';

let BASE_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');
if (BASE_URL.endsWith('/api')) {
    BASE_URL = BASE_URL.slice(0, -4);
}

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken=localStorage.getItem('token');
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        // Handle cases where a 200 OK returns HTML instead of JSON (common in misconfigured proxies)
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
            console.error('API Misconfiguration: Received HTML instead of JSON. Check VITE_BASE_URL.');
            const error = new Error('Invalid API Response (HTML)');
            error.code = 'ERR_INVALID_RESPONSE';
            return Promise.reject(error);
        }
        return response;
    },
    (error) => {
        if(error.response){
            if(error.response.status === 500){
                console.error('Server error occurred.');
            }
            if(error.response.status === 404){
                console.error(`Route not found: ${error.config.url}. BaseURL: ${error.config.baseURL}`);
            }
        } else if(error.code === 'ECONNABORTED'){
            console.error('Request timeout. Please try again.');
        } else if (!import.meta.env.VITE_BASE_URL && !import.meta.env.DEV) {
            console.error('DEPLOYMENT ERROR: VITE_BASE_URL is not set in production!');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;