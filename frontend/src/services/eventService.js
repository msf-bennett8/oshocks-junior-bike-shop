import api, { eventAPI } from './api';

const eventService = {
  // ─── Public ───
  getEvents: (params = {}) => eventAPI.getEvents(params),
  getEvent: (eventCode) => eventAPI.getEvent(eventCode),

  // ─── Protected (auth required) ───
  /**
   * Create event with FormData (supports file uploads)
   * @param {Object} data - Event data object
   * @param {File[]} images - Array of image File objects
   */
  createEvent: (data, images = []) => {
    const formData = new FormData();

    // Append all scalar fields
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      
      if (key === 'photos' && Array.isArray(value)) {
        // Base64 photos (fallback) — send as JSON string
        formData.append('photos', JSON.stringify(value));
      } else if (Array.isArray(value)) {
        // Send arrays as Laravel array notation: field[0], field[1], etc.
        value.forEach((item, idx) => {
          formData.append(`${key}[${idx}]`, item);
        });
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, value);
      }
    });

    // Append image files
    images.forEach((image, idx) => {
      formData.append(`images[${idx}]`, image);
    });

    return eventAPI.createEvent(formData);
  },

  /**
   * Update event with FormData
   */
    updateEvent: (eventCode, data, images = [], removePhotos = []) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value)) {
        // Send arrays as Laravel array notation
        value.forEach((item, idx) => {
          formData.append(`${key}[${idx}]`, item);
        });
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, value);
      }
    });

    images.forEach((image, idx) => {
      formData.append(`images[${idx}]`, image);
    });

    removePhotos.forEach((publicId, idx) => {
      formData.append(`remove_photos[${idx}]`, publicId);
    });

    return eventAPI.updateEvent(eventCode, formData);
  },

  deleteEvent: (eventCode) => eventAPI.deleteEvent(eventCode),
  getMyEvents: (params = {}) => eventAPI.getMyEvents(params),
  getEventStats: (eventCode) => eventAPI.getEventStats(eventCode),
};

export default eventService;