// Legal Document Acceptance Tracker with Version Control
// Adapted from AccellaX pattern for Oshocks

// Version constants (update these when legal docs change)
export const LEGAL_VERSIONS = {
  TERMS_OF_SERVICE: '1.0.0',
  PRIVACY_POLICY: '1.0.0',
  COOKIE_POLICY: '1.0.0',
};

// Legal acceptance events
export const LEGAL_EVENTS = {
  TERMS_OPENED: 'terms_opened',
  PRIVACY_OPENED: 'privacy_opened',
  COOKIE_OPENED: 'cookie_opened',
  TERMS_SCROLLED: 'terms_scrolled_to_bottom',
  PRIVACY_SCROLLED: 'privacy_scrolled_to_bottom',
  COOKIE_SCROLLED: 'cookie_scrolled_to_bottom',
  ALL_ACCEPTED: 'all_documents_accepted',
};

const LEGAL_STORAGE_KEY = 'oshocks_legal_acceptance';

/**
 * Get markdown content from local files
 */
export const getLegalDocumentContent = async (type) => {
  const fileMap = {
    terms: '/legal-md/TERMS_OF_SERVICE.md',
    privacy: '/legal-md/PRIVACY_POLICY.md',
    cookie: '/legal-md/COOKIE_POLICY.md',
  };

  try {
    const response = await fetch(fileMap[type]);
    if (!response.ok) throw new Error(`Failed to load ${type}`);
    return await response.text();
  } catch (error) {
    console.error(`Error loading ${type}:`, error);
    return null;
  }
};

/**
 * Track when a legal document is opened
 */
export const trackDocumentOpened = (documentType) => {
  try {
    const timestamp = new Date().toISOString();
    localStorage.setItem(`oshocks_legal_${documentType}_opened_at`, timestamp);
    return { success: true, timestamp };
  } catch (error) {
    console.error('Error tracking document opened:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Track when a legal document is scrolled to bottom
 */
export const trackDocumentScrolledToBottom = (documentType) => {
  try {
    const timestamp = new Date().toISOString();
    localStorage.setItem(`oshocks_legal_${documentType}_scrolled_at`, timestamp);
    return { success: true, timestamp };
  } catch (error) {
    console.error('Error tracking document scrolled:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Record legal acceptance (all three documents)
 */
export const recordLegalAcceptance = (userId, userEmail) => {
  try {
    const acceptanceData = {
      userId,
      userEmail,
      termsVersion: LEGAL_VERSIONS.TERMS_OF_SERVICE,
      privacyVersion: LEGAL_VERSIONS.PRIVACY_POLICY,
      cookieVersion: LEGAL_VERSIONS.COOKIE_POLICY,
      acceptedAt: new Date().toISOString(),
      termsOpenedAt: localStorage.getItem('oshocks_legal_terms_opened_at'),
      privacyOpenedAt: localStorage.getItem('oshocks_legal_privacy_opened_at'),
      cookieOpenedAt: localStorage.getItem('oshocks_legal_cookie_opened_at'),
      termsScrolledAt: localStorage.getItem('oshocks_legal_terms_scrolled_at'),
      privacyScrolledAt: localStorage.getItem('oshocks_legal_privacy_scrolled_at'),
      cookieScrolledAt: localStorage.getItem('oshocks_legal_cookie_scrolled_at'),
    };

    localStorage.setItem(LEGAL_STORAGE_KEY, JSON.stringify(acceptanceData));
    
    // Clear tracking data after acceptance
    clearLegalTracking();
    
    return { success: true, data: acceptanceData };
  } catch (error) {
    console.error('Error recording legal acceptance:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has accepted current versions
 */
export const hasAcceptedCurrentVersion = () => {
  try {
    const acceptanceJson = localStorage.getItem(LEGAL_STORAGE_KEY);
    if (!acceptanceJson) return false;

    const acceptance = JSON.parse(acceptanceJson);
    
    return (
      acceptance.termsVersion === LEGAL_VERSIONS.TERMS_OF_SERVICE &&
      acceptance.privacyVersion === LEGAL_VERSIONS.PRIVACY_POLICY &&
      acceptance.cookieVersion === LEGAL_VERSIONS.COOKIE_POLICY
    );
  } catch (error) {
    console.error('Error checking legal acceptance:', error);
    return false;
  }
};

/**
 * Get legal acceptance data
 */
export const getLegalAcceptance = () => {
  try {
    const acceptanceJson = localStorage.getItem(LEGAL_STORAGE_KEY);
    return acceptanceJson ? JSON.parse(acceptanceJson) : null;
  } catch (error) {
    console.error('Error getting legal acceptance:', error);
    return null;
  }
};

/**
 * Check if all documents have been read (scrolled to bottom)
 */
export const haveAllDocumentsBeenRead = () => {
  try {
    const termsScrolled = localStorage.getItem('oshocks_legal_terms_scrolled_at');
    const privacyScrolled = localStorage.getItem('oshocks_legal_privacy_scrolled_at');
    const cookieScrolled = localStorage.getItem('oshocks_legal_cookie_scrolled_at');
    
    return termsScrolled !== null && privacyScrolled !== null && cookieScrolled !== null;
  } catch (error) {
    console.error('Error checking if documents read:', error);
    return false;
  }
};

/**
 * Clear legal tracking data (after acceptance)
 */
export const clearLegalTracking = () => {
  try {
    localStorage.removeItem('oshocks_legal_terms_opened_at');
    localStorage.removeItem('oshocks_legal_privacy_opened_at');
    localStorage.removeItem('oshocks_legal_cookie_opened_at');
    localStorage.removeItem('oshocks_legal_terms_scrolled_at');
    localStorage.removeItem('oshocks_legal_privacy_scrolled_at');
    localStorage.removeItem('oshocks_legal_cookie_scrolled_at');
  } catch (error) {
    console.error('Error clearing legal tracking:', error);
  }
};

/**
 * Check for version update
 */
export const checkForVersionUpdate = () => {
  try {
    const acceptanceJson = localStorage.getItem(LEGAL_STORAGE_KEY);
    
    if (!acceptanceJson) {
      return { needsReAcceptance: true, reason: 'No prior acceptance' };
    }
    
    const acceptance = JSON.parse(acceptanceJson);
    
    const termsUpdated = acceptance.termsVersion !== LEGAL_VERSIONS.TERMS_OF_SERVICE;
    const privacyUpdated = acceptance.privacyVersion !== LEGAL_VERSIONS.PRIVACY_POLICY;
    const cookieUpdated = acceptance.cookieVersion !== LEGAL_VERSIONS.COOKIE_POLICY;
    
    if (termsUpdated || privacyUpdated || cookieUpdated) {
      return {
        needsReAcceptance: true,
        reason: 'Legal documents updated',
        updatedDocuments: {
          terms: termsUpdated,
          privacy: privacyUpdated,
          cookie: cookieUpdated,
        },
        newVersions: LEGAL_VERSIONS,
      };
    }
    
    return { needsReAcceptance: false };
  } catch (error) {
    console.error('Error checking version update:', error);
    return { needsReAcceptance: false, error: error.message };
  }
};

/**
 * Fetch versions from GitHub (stub for future GitHub integration)
 */
export const fetchVersionsFromGitHub = async () => {
  // For now, return local versions. In production, fetch from GitHub raw files
  return {
    terms: LEGAL_VERSIONS.TERMS_OF_SERVICE,
    privacy: LEGAL_VERSIONS.PRIVACY_POLICY,
    cookie: LEGAL_VERSIONS.COOKIE_POLICY,
  };
};

export default {
  LEGAL_VERSIONS,
  LEGAL_EVENTS,
  getLegalDocumentContent,
  fetchVersionsFromGitHub,
  trackDocumentOpened,
  trackDocumentScrolledToBottom,
  recordLegalAcceptance,
  hasAcceptedCurrentVersion,
  getLegalAcceptance,
  haveAllDocumentsBeenRead,
  clearLegalTracking,
  checkForVersionUpdate,
};
