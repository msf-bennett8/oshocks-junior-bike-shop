// ============================================================================
// GUEST SESSION — Anonymous user chat persistence
// Generates anonXXXX IDs, persists across sessions, links on login
// ============================================================================

const GUEST_SESSION_KEY = 'oshocks_guest_session_id';
const GUEST_NAME_KEY = 'oshocks_guest_name';
const GUEST_EMAIL_KEY = 'oshocks_guest_email';

/**
 * Generate a cryptographically random 4-digit number
 */
const generateRandomDigits = () => {
  const array = new Uint32Array(1);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  }
  return 1000 + (array[0] % 9000);
};

/**
 * Generate anonymous display name: anonXXXX
 */
export const generateAnonName = () => {
  const digits = generateRandomDigits();
  return `anon${digits}`;
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const getGuestSessionId = () => {
  let sessionId = localStorage.getItem(GUEST_SESSION_KEY);
  if (!sessionId) {
    sessionId = `guest_${generateUUID()}`;
    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const clearGuestSession = () => {
  localStorage.removeItem(GUEST_SESSION_KEY);
  localStorage.removeItem(GUEST_NAME_KEY);
  localStorage.removeItem(GUEST_EMAIL_KEY);
};

export const getGuestProfile = () => ({
  name: localStorage.getItem(GUEST_NAME_KEY),
  email: localStorage.getItem(GUEST_EMAIL_KEY),
});

export const setGuestProfile = (name, email) => {
  if (name) localStorage.setItem(GUEST_NAME_KEY, name);
  if (email) localStorage.setItem(GUEST_EMAIL_KEY, email);
};

/**
 * Check if current user is in guest mode (no auth token but has guest session)
 */
export const isGuest = () => {
  return !localStorage.getItem('authToken') && !!localStorage.getItem(GUEST_SESSION_KEY);
};

export const hasGuestSession = () => {
  return !!localStorage.getItem(GUEST_SESSION_KEY);
};

/**
 * Link guest session to authenticated user
 * Call this immediately after login/register
 */
export const linkGuestSessionOnLogin = async (api) => {
  const guestSessionId = localStorage.getItem(GUEST_SESSION_KEY);
  if (!guestSessionId) return;

  try {
    const res = await api.post('/conversations/link-guest', {}, {
      headers: {
        'X-Guest-Session-ID': guestSessionId,
      },
    });
    
    if (res.data.linked_count > 0) {
      console.log(`✅ Linked ${res.data.linked_count} guest conversation(s)`);
    }
    
    // Clear guest session after successful link
    clearGuestSession();
    return res.data;
  } catch (err) {
    console.error('Failed to link guest sessions:', err);
    // Don't clear - retry on next login
  }
};

/**
 * Initialize guest session with anon name if needed
 */
export const initializeGuestSession = () => {
  const sessionId = getGuestSessionId();
  const profile = getGuestProfile();
  
  if (!profile.name) {
    const anonName = generateAnonName();
    setGuestProfile(anonName, profile.email);
  }
  
  return {
    sessionId,
    profile: getGuestProfile(),
  };
};

/**
 * Get guest name for display (falls back to anonXXXX)
 */
export const getGuestDisplayName = () => {
  const profile = getGuestProfile();
  return profile.name || generateAnonName();
};

export default {
  generateAnonName,
  getGuestSessionId,
  getGuestProfile,
  setGuestProfile,
  clearGuestSession,
  linkGuestSessionOnLogin,
  isGuest,
  hasGuestSession,
  getGuestDisplayName,
  initializeGuestSession,
};
