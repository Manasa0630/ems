const API_BASE = typeof window !== 'undefined' && window.location.port === '5000'
  ? '/api'
  : 'http://localhost:5000/api';

function getAuthHeaders() {
  const user = JSON.parse(localStorage.getItem('ems_user') || 'null');
  if (!user) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    'x-actor-type': user.actor_type || 'user',
    'x-actor-id': String(user.user_id || user.admin_id)
  };
}

async function request(endpoint, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  adminLogin: (email, password) =>
    request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  userLogin: (email, password) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  userRegister: (name, email, password) =>
    request('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.venue && params.venue !== 'all') query.append('venue', params.venue);
    if (params.search) query.append('search', params.search);
    if (params.availability && params.availability !== 'all') query.append('availability', params.availability);
    const qs = query.toString();
    return request(`/events${qs ? `?${qs}` : ''}`);
  },

  getEventById: (id) => request(`/events/${id}`),

  createEvent: (eventData) =>
    request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    }),

  updateEvent: (id, eventData) =>
    request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    }),

  deleteEvent: (id) =>
    request(`/events/${id}`, {
      method: 'DELETE'
    }),

  getEventRegistrations: (eventId) =>
    request(`/events/${eventId}/registrations`),

  // Categories & Venues
  getCategories: () => request('/categories'),
  createCategory: (data) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: 'DELETE'
    }),

  getVenues: () => request('/venues'),
  createVenue: (data) =>
    request('/venues', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteVenue: (id) =>
    request(`/venues/${id}`, {
      method: 'DELETE'
    }),

  // Registrations
  registerForEvent: (userId, eventId) =>
    request('/registrations', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, event_id: eventId })
    }),

  cancelRegistration: (registrationId) =>
    request(`/registrations/${registrationId}`, {
      method: 'DELETE'
    }),

  getAllRegistrations: () => request('/registrations'),

  getUserRegistrations: (userId) => request(`/users/${userId}/events`),

  // Payments (Simulated)
  makePayment: (registrationId, method = 'Simulated Payment') =>
    request(`/payments/${registrationId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payment_method: method })
    }),

  // Attendance
  markAttendance: (registrationId) =>
    request(`/attendance/${registrationId}`, {
      method: 'POST'
    }),

  getAttendanceForEvent: (eventId, noShowsOnly = false) =>
    request(`/attendance/event/${eventId}${noShowsOnly ? '?noShowsOnly=true' : ''}`),

  // Feedback
  submitFeedback: (registrationId, rating, comment) =>
    request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ registration_id: registrationId, rating, comment })
    }),

  getEventFeedback: (eventId) => request(`/feedback/event/${eventId}`),

  // Notifications
  getNotifications: (userId) => request(`/notifications/${userId}`),
  getUnreadNotifCount: (userId) => request(`/notifications/${userId}/unread-count`),
  markNotifRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: 'PUT'
    }),
  markAllNotifsRead: (userId) =>
    request(`/notifications/user/${userId}/read-all`, {
      method: 'PUT'
    })
};
