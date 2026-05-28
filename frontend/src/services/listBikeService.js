import api from './api';

/**
 * Dedicated service for bike LISTING operations (create/update)
 * Uses multipart/form-data for image uploads
 * Separated from bikeService.js to avoid breaking existing read-only operations
 */

const listBikeService = {
  /**
   * Create a new bike listing with photo uploads
   * @param {Object} formData - Plain JS object with form fields
   * @param {File[]} photoFiles - Array of File objects from input[type=file]
   */
  createListing: (formData, photoFiles = []) => {
    const payload = new FormData();

    // Append all text fields
    payload.append('name', formData.name);
    payload.append('brand', formData.brand);
    payload.append('model', formData.model);
    payload.append('year', String(formData.year));
    payload.append('category', formData.category);
    payload.append('frame_size', formData.frame_size);
    payload.append('wheel_size', formData.wheel_size);
    payload.append('bike_condition', formData.bike_condition);
    payload.append('description', formData.description);

    // Pricing
    if (formData.hourly_rate) payload.append('hourly_rate', String(formData.hourly_rate));
    payload.append('daily_rate', String(formData.daily_rate));
    if (formData.weekly_rate) payload.append('weekly_rate', String(formData.weekly_rate));
    if (formData.monthly_rate) payload.append('monthly_rate', String(formData.monthly_rate));
    payload.append('security_deposit', String(formData.security_deposit));
    payload.append('min_rental_hours', String(formData.min_rental_hours));
    payload.append('max_rental_days', String(formData.max_rental_days));

    // Location & Rules
    payload.append('location_address', formData.location_address);
    if (formData.location_lat) payload.append('location_lat', String(formData.location_lat));
    if (formData.location_lng) payload.append('location_lng', String(formData.location_lng));
    payload.append('pickup_type', formData.pickup_type);
    if (formData.delivery_fee) payload.append('delivery_fee', String(formData.delivery_fee));
    payload.append('instant_book', formData.instant_book ? '1' : '0');
    if (formData.response_time_hours) payload.append('response_time_hours', String(formData.response_time_hours));
    if (formData.rental_rules) payload.append('rental_rules', formData.rental_rules);
    if (formData.cancellation_policy) payload.append('cancellation_policy', formData.cancellation_policy);
    payload.append('insurance_included', formData.insurance_included ? '1' : '0');

    // Features array
    if (formData.bike_features && formData.bike_features.length > 0) {
      formData.bike_features.forEach((feature, idx) => {
        payload.append(`bike_features[${idx}]`, feature);
      });
    }

    // Owner type
    payload.append('owner_type', formData.owner_type || 'user');

    // Photos as files (multipart upload)
    photoFiles.forEach((file, idx) => {
      if (file instanceof File) {
        payload.append(`photos[${idx}]`, file);
      }
    });

    return api.post('/bike-rentals', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Update an existing bike listing
   * @param {string} listingCode 
   * @param {Object} formData 
   * @param {File[]} photoFiles 
   */
  updateListing: (listingCode, formData, photoFiles = []) => {
    const payload = new FormData();

    // Only append fields that are provided
    if (formData.name) payload.append('name', formData.name);
    if (formData.brand) payload.append('brand', formData.brand);
    if (formData.model) payload.append('model', formData.model);
    if (formData.year) payload.append('year', String(formData.year));
    if (formData.category) payload.append('category', formData.category);
    if (formData.frame_size) payload.append('frame_size', formData.frame_size);
    if (formData.wheel_size) payload.append('wheel_size', formData.wheel_size);
    if (formData.bike_condition) payload.append('bike_condition', formData.bike_condition);
    if (formData.description) payload.append('description', formData.description);
    if (formData.hourly_rate !== undefined) payload.append('hourly_rate', String(formData.hourly_rate));
    if (formData.daily_rate !== undefined) payload.append('daily_rate', String(formData.daily_rate));
    if (formData.weekly_rate !== undefined) payload.append('weekly_rate', String(formData.weekly_rate));
    if (formData.monthly_rate !== undefined) payload.append('monthly_rate', String(formData.monthly_rate));
    if (formData.security_deposit !== undefined) payload.append('security_deposit', String(formData.security_deposit));
    if (formData.min_rental_hours !== undefined) payload.append('min_rental_hours', String(formData.min_rental_hours));
    if (formData.max_rental_days !== undefined) payload.append('max_rental_days', String(formData.max_rental_days));
    if (formData.location_address) payload.append('location_address', formData.location_address);
    if (formData.location_lat) payload.append('location_lat', String(formData.location_lat));
    if (formData.location_lng) payload.append('location_lng', String(formData.location_lng));
    if (formData.pickup_type) payload.append('pickup_type', formData.pickup_type);
    if (formData.delivery_fee !== undefined) payload.append('delivery_fee', String(formData.delivery_fee));
    if (formData.instant_book !== undefined) payload.append('instant_book', formData.instant_book ? '1' : '0');
    if (formData.response_time_hours) payload.append('response_time_hours', String(formData.response_time_hours));
    if (formData.rental_rules !== undefined) payload.append('rental_rules', formData.rental_rules);
    if (formData.cancellation_policy !== undefined) payload.append('cancellation_policy', formData.cancellation_policy);
    if (formData.insurance_included !== undefined) payload.append('insurance_included', formData.insurance_included ? '1' : '0');
    if (formData.is_active !== undefined) payload.append('is_active', formData.is_active ? '1' : '0');

    // Features
    if (formData.bike_features && formData.bike_features.length > 0) {
      formData.bike_features.forEach((feature, idx) => {
        payload.append(`bike_features[${idx}]`, feature);
      });
    }

    // Photos
    photoFiles.forEach((file, idx) => {
      if (file instanceof File) {
        payload.append(`photos[${idx}]`, file);
      }
    });

    // Use POST with _method for FormData compatibility
    payload.append('_method', 'PUT');

    return api.post(`/bike-rentals/${listingCode}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default listBikeService;
