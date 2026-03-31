const BASE = '';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || data.message || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }
  return data;
}

export const authApi = {
  login: (body) => api('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => api('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/api/auth/me'),
};

export const trainersApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/trainers${q ? `?${q}` : ''}`);
  },
  get: (id) => api(`/api/trainers/${id}`),
};

export const programsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/programs${q ? `?${q}` : ''}`);
  },
  get: (id) => api(`/api/programs/${id}`),
};

export const slotsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/slots${q ? `?${q}` : ''}`);
  },
};

export const bookingsApi = {
  create: (body) => api('/api/bookings', { method: 'POST', body: JSON.stringify(body) }),
  list: () => api('/api/bookings'),
  cancel: (id) => api(`/api/bookings/${id}/cancel`, { method: 'POST' }),
  reschedule: (id, newSlotId) =>
    api(`/api/bookings/${id}/reschedule`, { method: 'POST', body: JSON.stringify({ newSlotId }) }),
  approveReschedule: (id) => api(`/api/bookings/${id}/reschedule/approve`, { method: 'POST' }),
  rejectReschedule: (id) => api(`/api/bookings/${id}/reschedule/reject`, { method: 'POST' }),
  complete: (id) => api(`/api/bookings/${id}/complete`, { method: 'POST' }),
};

export const paymentsApi = {
  pay: (bookingId) => api('/api/payments', { method: 'POST', body: JSON.stringify({ bookingId }) }),
  getByBooking: (bookingId) => api(`/api/payments/booking/${bookingId}`),
};

export const reviewsApi = {
  create: (body) => api('/api/reviews', { method: 'POST', body: JSON.stringify(body) }),
  list: (trainerId) => api(`/api/reviews${trainerId ? `?trainerId=${trainerId}` : ''}`),
};

export const progressApi = {
  get: () => api('/api/progress'),
  log: (body) => api('/api/progress/log', { method: 'POST', body: JSON.stringify(body) }),
};
