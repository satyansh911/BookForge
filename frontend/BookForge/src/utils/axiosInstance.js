import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

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
        return response;
    },
    (error) => {
        if(error.response){
            if(error.response.status === 500){
                console.error('Server error occurred.');
            }
        } else if(error.code === 'ECONNABORTED'){
            console.error('Request timeout. Please try again.');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;