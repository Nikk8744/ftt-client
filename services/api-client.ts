import axios from 'axios';

// Use the environment variable if available, otherwise use the proxy path
// const API_BASE_URL = 'http://localhost:5000/api/v1';
// Use relative path to leverage Next.js rewrites (setup in next.config.mjs)
// This avoids CORS issues and ensures cookies are treated as first-party
const API_BASE_URL = '/api/v1';

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
      // Check if it's a legitimate auth error (not just a random 401 like bad credentials during login)
      // We want to catch "Invalid Access token" or "Unauthorized request" from global middleware
      // but avoid catching "Invalid email or password" which is a 401 from login endpoint
      const isLoginEndpoint = error.config?.url?.includes('/user/login');

      if (!isLoginEndpoint) {
        // Clear any existing auth data
        localStorage.removeItem('auth-storage'); // Use correct key

        // Use router.push instead of window.location for better navigation
        window.location.href = '/login';
      }
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