import api from './api';

/**
 * Dedicated service for community post creation with multipart image uploads
 * Separated from communityService.js to handle FormData + file uploads properly
 */

const communityEventService = {
  /**
   * Create a new community post with photo file uploads
   * @param {Object} data - Plain JS object with form fields
   * @param {File[]} photoFiles - Array of File objects from input[type=file]
   * @param {string[]} photoCaptions - Array of captions matching photoFiles index
   */
  createPost: (data, photoFiles = [], photoCaptions = []) => {
    const formData = new FormData();

    // Append all scalar fields
    const scalarFields = [
      'title', 'event_id', 'ride_date', 'ride_type',
      'ride_distance_km', 'ride_duration_minutes', 'elevation_gain_m',
      'avg_speed_kmh', 'max_speed_kmh', 'calories_burned',
      'content', 'mood', 'bike_used', 'visibility'
    ];

    scalarFields.forEach(field => {
      if (data[field] !== null && data[field] !== undefined) {
        formData.append(field, String(data[field]));
      }
    });

    // Boolean fields
    formData.append('allow_comments', data.allow_comments ? '1' : '0');

    // Arrays as Laravel array notation
    if (data.gear && Array.isArray(data.gear)) {
      data.gear.forEach((item, idx) => formData.append(`gear[${idx}]`, item));
    }
    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach((item, idx) => formData.append(`tags[${idx}]`, item));
    }

    // Photo files (multipart upload)
    photoFiles.forEach((file, idx) => {
      if (file instanceof File) {
        formData.append(`images[${idx}]`, file);
      }
    });

    // Photo captions
    photoCaptions.forEach((caption, idx) => {
      if (caption !== null && caption !== undefined) {
        formData.append(`photo_captions[${idx}]`, String(caption));
      }
    });

    return api.post('/community/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Update post with new photos
   */
  updatePost: (postCode, data, photoFiles = [], photoCaptions = [], removePublicIds = []) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');

    // Scalar fields
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value)) {
        value.forEach((item, idx) => formData.append(`${key}[${idx}]`, item));
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, String(value));
      }
    });

    // New photo files
    photoFiles.forEach((file, idx) => {
      if (file instanceof File) {
        formData.append(`images[${idx}]`, file);
      }
    });

    // Captions
    photoCaptions.forEach((caption, idx) => {
      formData.append(`photo_captions[${idx}]`, String(caption ?? ''));
    });

    // Images to remove
    removePublicIds.forEach((publicId, idx) => {
      formData.append(`remove_images[${idx}]`, publicId);
    });

    return api.post(`/community/posts/${postCode}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default communityEventService;
