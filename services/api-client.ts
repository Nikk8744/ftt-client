import axios from 'axios';

// Use the proxy path for API requests
const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to handle JWT tokens
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      // Handle unauthorized errors (e.g., redirect to login)
      localStorage.removeItem('auth-token');
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

  // Add auth token to headers if available
  const token = localStorage.getItem('auth-token');
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

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