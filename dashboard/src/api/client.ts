// Read API base URL from runtime config (injected by entrypoint.sh) or fallback to build-time env
const API_BASE = (window as any).__RUNTIME_CONFIG__?.VITE_API_BASE_URL 
  || import.meta.env.VITE_API_BASE_URL 
  || 'http://localhost:3000/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('Backend returned HTML instead of JSON. Is the backend running?');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected response from backend at ${url}. Is the API reachable?`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  setupRequired: () =>
    request('/auth/setup-required'),
  setupAdmin: (data: { email: string; password: string; name?: string; username?: string }) =>
    request('/auth/setup', { method: 'POST', body: JSON.stringify(data) }),
  resetSetup: () =>
    request('/auth/reset-setup', { method: 'POST' }),

  getStats: () => request('/admin/stats'),
  getUsers: () => request('/admin/users'),
  createUser: (data: any) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/admin/users/${id}`, { method: 'DELETE' }),

  getMemories: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/admin/memories${qs}`);
  },
  getProjects: () => request('/admin/projects'),
  getApiKeys: () => request('/admin/api-keys'),
  getWorkspaces: () => request('/admin/workspaces'),

  // Embedding Providers (admin only)
  getEmbeddingProviders: () => request('/admin/embedding-providers'),
  createEmbeddingProvider: (data: any) => request('/admin/embedding-providers', { method: 'POST', body: JSON.stringify(data) }),
  updateEmbeddingProvider: (id: string, data: any) => request(`/admin/embedding-providers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEmbeddingProvider: (id: string) => request(`/admin/embedding-providers/${id}`, { method: 'DELETE' }),
  setDefaultEmbeddingProvider: (id: string) => request(`/admin/embedding-providers/${id}/set-default`, { method: 'POST' }),
  testEmbeddingProvider: (id: string) => request(`/admin/embedding-providers/${id}/test`, { method: 'POST' }),
};
