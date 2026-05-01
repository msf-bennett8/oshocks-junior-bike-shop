// ============================================================================
// GUEST SESSION — Anonymous user chat persistence
// ============================================================================

const GUEST_SESSION_KEY = 'oshocks_guest_session_id';
const GUEST_NAME_KEY = 'oshocks_guest_name';
const GUEST_EMAIL_KEY = 'oshocks_guest_email';

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