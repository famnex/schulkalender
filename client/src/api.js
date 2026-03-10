import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.DEV ? '/kalender_new/api' : '/kalender_new/api', // Keep it consistent for now
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Notify the app about auth failure
            window.dispatchEvent(new CustomEvent('auth-failure'));
        }
        return Promise.reject(error);
    }
);

export default api;
