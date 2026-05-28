import api from './api';

const eventService = {
  // ─── Public ───
  getEvents: (params = {}) => api.get('/events', { params }),
  getEvent: (eventCode) => api.get(`/events/${eventCode}`),

  // ─── Protected (auth required) ───
  createEvent: (data) => api.post('/events', data),
  updateEvent: (eventCode, data) => api.put(`/events/${eventCode}`, data),
  deleteEvent: (eventCode) => api.delete(`/events/${eventCode}`),
  getMyEvents: (params = {}) => api.get('/events/my/events', { params }),
  getEventStats: (eventCode) => api.get(`/events/${eventCode}/stats`),
};

export default eventService;
