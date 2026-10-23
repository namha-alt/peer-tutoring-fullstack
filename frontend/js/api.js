// SlotSync REST API Client (Talking to Node.js + Express + MongoDB)
const API_BASE_URL = '/api';

const api = {
  // Token & Session Storage
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

  // Generic Request Helper with Live Traffic Monitoring
  request: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = api.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const startTime = Date.now();
    let response;
    let data;
    let error;

    try {
      response = await fetch(url, {
        ...options,
        headers
      });

      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const durationMs = Date.now() - startTime;
      const status = response ? response.status : 0;

      // Broadcast live event for the Live API HUD
      const trafficDetail = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString(),
        method: options.method || 'GET',
        endpoint: url,
        status: status,
        durationMs: durationMs,
        requestBody: options.body ? JSON.parse(options.body) : null,
        responseBody: data || (error ? { error: error.message } : null)
      };

      window.dispatchEvent(new CustomEvent('api:request-logged', { detail: trafficDetail }));
    }
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
    // Update local cached user
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
  createBooking: async (slotId, date, topic, specifics, attachmentUrl = '', attachmentOriginalName = '') => {
    return await api.request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ slotId, date, topic, specifics, attachmentUrl, attachmentOriginalName })
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
  },

  // System & Traffic
  getSystemTraffic: async () => {
    const result = await api.request('/system/traffic', { method: 'GET' });
    return result.logs || [];
  },

  clearSystemTraffic: async () => {
    return await api.request('/system/traffic', { method: 'DELETE' });
  },

  getDbStats: async () => {
    return await api.request('/system/db-stats', { method: 'GET' });
  }
};
