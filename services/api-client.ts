import axios from 'axios';

// Use the environment variable if available, otherwise use the proxy path
// const API_BASE_URL = 'http://localhost:5000/api/v1';
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1` || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // This is crucial for cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to handle JWT tokens
apiClient.interceptors.request.use((config) => {
  // Ensure credentials are included in every request
  config.withCredentials = true;
  return config;
});

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Only redirect to login if it's a 401 and we're not already on the login page
    if (response && response.status === 401 && window.location.pathname !== '/login') {
      // Clear any existing auth data
      localStorage.removeItem('user');
      localStorage.removeItem('auth-token');
      
      // Use router.push instead of window.location for better navigation
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
  
/**
 * Base fetch function with error handling and automatic JSON parsing
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Merge default headers with passed headers
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Include credentials for cookies
    credentials: 'include',
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Parse the JSON response
    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      // Format error message from API response
      const errorMessage = data.msg || data.message || 'An error occurred';
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    // Handle fetch errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * GET request helper
 */
export function apiGet<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'GET',
    ...options,
  });
}

/**
 * POST request helper
 */
export function apiPost<T, D extends Record<string, unknown> = Record<string, unknown>>(
  endpoint: string,
  data?: D,
  options: RequestInit = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PATCH request helper
 */
export function apiPatch<T, D extends Record<string, unknown> = Record<string, unknown>>(
  endpoint: string,
  data?: D,
  options: RequestInit = {}
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Centralized error handler for API requests
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

export default apiClient; 