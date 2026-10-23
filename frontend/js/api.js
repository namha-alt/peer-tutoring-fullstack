// SlotSync REST API Client (Works with Local Express server and Deployed Render Backend)
const DEPLOYED_BACKEND_URL = 'https://peer-tutoring-fullstack.onrender.com';
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const isRender = typeof window !== 'undefined' && window.location.origin.includes('onrender.com');

const API_BASE_URL = (isLocalhost || isRender)
  ? '/api'
  : `${DEPLOYED_BACKEND_URL}/api`;

const api = {
  // Token & Session Storage in localStorage
  getToken: () => localStorage.getItem('SlotSync_token'),
  setToken: (token) => localStorage.setItem('SlotSync_token', token),
  clearToken: () => localStorage.removeItem('SlotSync_token'),

  getUser: () => {
    const userStr = localStorage.getItem('SlotSync_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setUser: (user) => localStorage.setItem('SlotSync_user', JSON.stringify(user)),
  clearUser: () => localStorage.removeItem('SlotSync_user'),

  getSession: () => {
    return api.getUser();
  },

  clearSession: () => {
    api.clearToken();
    api.clearUser();
  },

  // Generic Request Helper
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = api.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  },

  // Auth Endpoints
  register: async (userData) => {
    const result = await api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (result.token) api.setToken(result.token);
    if (result.user) api.setUser(result.user);
    return result;
  },

  login: async (email, password) => {
    const result = await api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (result.token) api.setToken(result.token);
    if (result.user) api.setUser(result.user);
    return result;
  },

  getMe: async () => {
    const result = await api.request('/auth/me', { method: 'GET' });
    if (result.user) api.setUser(result.user);
    return result.user;
  },

  // Users & Tutors Endpoints
  getTutors: async () => {
    const result = await api.request('/users/tutors', { method: 'GET' });
    return result.data || [];
  },

  updateTutorCapacity: async (maxCapacity) => {
    const result = await api.request('/users/tutor/capacity', {
      method: 'PUT',
      body: JSON.stringify({ maxCapacity })
    });
    const user = api.getUser();
    if (user) {
      user.maxCapacity = maxCapacity;
      api.setUser(user);
    }
    return result;
  },

  getUserStats: async () => {
    const result = await api.request('/users/stats', { method: 'GET' });
    return result.data || {};
  },

  // Slots Endpoints
  getAvailableSlots: async () => {
    const result = await api.request('/slots/available', { method: 'GET' });
    return result.data || [];
  },

  getMySlots: async () => {
    const result = await api.request('/slots/my', { method: 'GET' });
    return result.data || [];
  },

  toggleSlot: async (date, startHour) => {
    return await api.request('/slots/toggle', {
      method: 'POST',
      body: JSON.stringify({ date, startHour })
    });
  },

  cancelSlot: async (slotId, cancelReason) => {
    return await api.request(`/slots/${slotId}`, {
      method: 'DELETE',
      body: JSON.stringify({ cancelReason })
    });
  },

  // Bookings Endpoints
  createBooking: async (slotId, date, topic, specifics) => {
    return await api.request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ slotId, date, topic, specifics })
    });
  },

  getMyBookings: async () => {
    const result = await api.request('/bookings/my', { method: 'GET' });
    return result.data || [];
  },

  updateBookingStatus: async (bookingId, status) => {
    return await api.request(`/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  cancelBooking: async (bookingId, cancelReason) => {
    return await api.request(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancelReason })
    });
  }
};
