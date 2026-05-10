import axios from "axios";
const BaseUrl = "http://localhost:5001/";

export const axiosInstance = axios.create({
    baseURL: BaseUrl,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});
