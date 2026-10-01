/**
 * VaultHub API Client
 *
 * Configured fetch client with:
 * - Automatic base URL configuration
 * - Credentials inclusion for Django session authentication
 * - Automatic Django CSRF token acquisition and header injection (X-CSRFToken)
 * - Structured API error parsing
 * - Blob download handler with Content-Disposition parsing
 */

export const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 
  '/api';

/**
 * Custom error class for API failures with HTTP status code and response payload.
 */
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Retrieve a cookie value by name from document.cookie.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const pattern = new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)');
  const matches = document.cookie.match(pattern);
  return matches ? decodeURIComponent(matches[1]) : null;
}

let csrfPromise: Promise<string | null> | null = null;

/**
 * Ensure a CSRF token cookie is present from Django.
 * Calls /api/auth/csrf/ if the cookie is missing.
 */
export async function ensureCsrfToken(): Promise<string | null> {
  let token = getCookie('csrftoken');
  if (token) return token;

  if (csrfPromise) return csrfPromise;

  csrfPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn('Could not initialize CSRF cookie:', response.status);
      }
      return getCookie('csrftoken');
    } catch (err) {
      console.warn('Network error while requesting CSRF cookie:', err);
      return null;
    } finally {
      csrfPromise = null;
    }
  })();

  return csrfPromise;
}

/**
 * Parse an error response from Django REST Framework into a user-friendly string.
 */
function extractErrorMessage(data: any, status: number): string {
  if (!data) {
    return `Request failed with status ${status}`;
  }

  if (typeof data === 'string') {
    return data;
  }

  // DRF standard error: { "detail": "Invalid credentials." }
  if (data.detail && typeof data.detail === 'string') {
    return data.detail;
  }

  // DRF non_field_errors: { "non_field_errors": ["Invalid username/password"] }
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors[0];
  }

  // DRF field-specific validation errors: { "studentId": ["Already exists."], ... }
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const firstVal = data[keys[0]];
      const msg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
      return `${keys[0]}: ${msg}`;
    }
  }

  return `Request failed with status ${status}`;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Core HTTP request handler.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  // Build query string if params are passed
  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(options.params)) {
      if (val !== undefined) {
        searchParams.append(key, String(val));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  // If payload is standard JSON (not FormData), set Content-Type
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && options.body && typeof options.body === 'string') {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  // Ensure CSRF token is provided for state-changing requests
  if (isMutating) {
    let csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
      csrfToken = await ensureCsrfToken();
    }
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }
  }

  const fetchOptions: RequestInit = {
    ...options,
    method,
    headers,
    credentials: 'include', // Always send session cookies
  };

  const response = await fetch(url, fetchOptions);

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Parse JSON response
  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    const errorMsg = extractErrorMessage(responseData, response.status);
    throw new ApiError(errorMsg, response.status, responseData);
  }

  return responseData as T;
}

/**
 * Download a file as a blob and automatically trigger browser download.
 */
async function downloadBlob(
  endpoint: string, 
  fallbackFilename: string = 'download'
): Promise<{ blob: Blob; fileName: string; checksumSHA256?: string }> {
  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = new Headers();
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    headers.set('X-CSRFToken', csrfToken);
  }

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Download failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      errorDetail = extractErrorMessage(errJson, response.status);
    } catch {
      // ignore
    }
    throw new ApiError(errorDetail, response.status);
  }

  // Extract filename from Content-Disposition header if available
  let fileName = fallbackFilename;
  const disposition = response.headers.get('content-disposition');
  if (disposition) {
    const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
    if (match && match[1]) {
      fileName = match[1].trim();
    }
  }

  const checksumSHA256 = response.headers.get('x-checksum-sha256') || undefined;
  const blob = await response.blob();

  // Trigger browser download in browser environments
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  }

  return { blob, fileName, checksumSHA256 };
}

export const apiClient = {
  get: <T>(url: string, options?: RequestOptions) => 
    request<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, data?: any, options?: RequestOptions) => 
    request<T>(url, { 
      ...options, 
      method: 'POST', 
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: <T>(url: string, data?: any, options?: RequestOptions) => 
    request<T>(url, { 
      ...options, 
      method: 'PUT', 
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  patch: <T>(url: string, data?: any, options?: RequestOptions) => 
    request<T>(url, { 
      ...options, 
      method: 'PATCH', 
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: <T>(url: string, options?: RequestOptions) => 
    request<T>(url, { ...options, method: 'DELETE' }),

  upload: <T>(url: string, formData: FormData, options?: RequestOptions) => 
    request<T>(url, { ...options, method: 'POST', body: formData }),

  download: downloadBlob,
};
