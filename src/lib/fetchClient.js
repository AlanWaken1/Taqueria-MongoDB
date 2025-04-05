// src/lib/fetchClient.js
export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const config = {
      ...options,
      headers
    };
  
    const response = await fetch(url, config);
    
    // Si recibimos un 401, podríamos manejar la renovación del token o el logout
    if (response.status === 401) {
      // Opcional: localStorage.removeItem('authToken');
      // Opcional: window.location.href = '/login';
    }
    
    return response;
  };