// Typed API client for The Pet Point backend
// All requests go through API_BASE_URL (Express backend)

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include', // send httpOnly cookie
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────
  auth: {
    signup: (body: object)  => request('/api/auth/signup',  { method: 'POST', body: JSON.stringify(body) }),
    login:  (body: object)  => request('/api/auth/login',   { method: 'POST', body: JSON.stringify(body) }),
    logout: ()              => request('/api/auth/logout',  { method: 'POST' }),
    me:     ()              => request('/api/auth/me'),
  },

  // ── Users ─────────────────────────────────────────────
  users: {
    get:    (username: string) => request(`/api/users/${username}`),
    update: (body: object)     => request('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  },

  // ── Admin ─────────────────────────────────────────────
  admin: {
    getPendingVendors: () => request('/api/admin/vendors/pending'),
    approveVendor: (id: string) => request(`/api/admin/vendors/${id}/approve`, { method: 'PATCH' }),
    getUnapprovedEvents: () => request('/api/admin/events'),
    approveEvent: (id: string) => request(`/api/admin/events/${id}/approve`, { method: 'PATCH' }),
    getAllBookings: () => request('/api/admin/bookings'),
  },

  // ── Pets ──────────────────────────────────────────────
  pets: {
    list:   ()              => request('/api/pets'),
    create: (body: object)  => request('/api/pets', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: object) => request(`/api/pets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string)    => request(`/api/pets/${id}`, { method: 'DELETE' }),
  },

  // ── Vendors ───────────────────────────────────────────
  vendors: {
    list:     (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/api/vendors${qs}`);
    },
    get:      (id: string)  => request(`/api/vendors/${id}`),
    register: (body: object) => request('/api/vendors/register', { method: 'POST', body: JSON.stringify(body) }),
  },

  // ── Bookings ──────────────────────────────────────────
  bookings: {
    create:       (body: object)              => request('/api/bookings',        { method: 'POST', body: JSON.stringify(body) }),
    mine:         ()                          => request('/api/bookings/me'),
    forVendor:    ()                          => request('/api/bookings/vendor'),
    updateStatus: (id: string, status: string) => request(`/api/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },

  // ── Messages ──────────────────────────────────────────
  messages: {
    send:   (body: object)      => request('/api/messages',          { method: 'POST', body: JSON.stringify(body) }),
    thread: (vendorId: string)  => request(`/api/messages/${vendorId}`),
    inbox:  ()                  => request('/api/messages/inbox'),
  },

  // ── Events ────────────────────────────────────────────
  events: {
    list:   ()           => request('/api/events'),
    get:    (id: string) => request(`/api/events/${id}`),
    create: (body: object) => request('/api/events', { method: 'POST', body: JSON.stringify(body) }),
    rsvp:   (id: string) => request(`/api/events/${id}/rsvp`, { method: 'POST' }),
  },

  // ── Community Posts ───────────────────────────────────
  posts: {
    feed:   (offset = 0)        => request(`/api/posts?limit=20&offset=${offset}`),
    create: (content: string)   => request('/api/posts', { method: 'POST', body: JSON.stringify({ content }) }),
    delete: (id: string)        => request(`/api/posts/${id}`, { method: 'DELETE' }),
  },
};
