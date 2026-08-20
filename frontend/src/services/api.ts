export class ApiError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  const customBase = import.meta.env.VITE_API_URL;
  if (customBase && customBase.trim() !== '') {
    const base = customBase.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}/api${cleanEndpoint}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `/api${cleanEndpoint}`;
};

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('campifa_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = getApiUrl(endpoint);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (netErr: any) {
    throw new ApiError(
      netErr.message || 'Cannot connect to backend server. Check your network or VITE_API_URL configuration.',
      0
    );
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 405) {
      throw new ApiError(
        'Backend server is not running at this domain. Please configure VITE_API_URL or Firebase Authentication.',
        405
      );
    }
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data?.errors);
  }

  return data;
}

export const api = {
  get: <T = any>(url: string, headers?: HeadersInit) => request<T>(url, { method: 'GET', headers }),
  post: <T = any>(url: string, body?: any, headers?: HeadersInit) =>
    request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  put: <T = any>(url: string, body?: any, headers?: HeadersInit) =>
    request<T>(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),
  delete: <T = any>(url: string, headers?: HeadersInit) =>
    request<T>(url, { method: 'DELETE', headers }),
};
