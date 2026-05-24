const hostname = window.location.hostname;

export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:5000`;
export const ML_BASE_URL = import.meta.env.VITE_ML_URL || `http://${hostname}:8000`;
