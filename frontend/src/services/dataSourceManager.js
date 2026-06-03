// src/services/dataSourceManager.js
// Data Source Manager — Local / Hybrid / Railway Production

const ENVIRONMENTS = {
  LOCAL: 'local',
  HYBRID: 'hybrid',
  PRODUCTION: 'production'
};

const DEFAULT_SOURCES = {
  [ENVIRONMENTS.LOCAL]: {
    name: 'Local',
    apiUrl: 'http://localhost:8000/api/v1',
    frontendUrl: 'http://localhost:3000',
    description: 'Docker on WSL',
    icon: 'Server',
    color: '#22c55e'
  },
  [ENVIRONMENTS.HYBRID]: {
    name: 'Hybrid',
    apiUrl: null, // Determined at runtime
    frontendUrl: 'http://localhost:3000',
    description: 'Auto-detect best source',
    icon: 'Shuffle',
    color: '#3b82f6'
  },
  [ENVIRONMENTS.PRODUCTION]: {
    name: 'Railway',
    apiUrl: 'https://oshocks-backend-production.up.railway.app/api/v1',
    frontendUrl: 'https://oshocks.vercel.app',
    description: 'Live production backend',
    icon: 'Globe',
    color: '#f97316'
  }
};

class DataSourceManager {
  constructor() {
    const stored = localStorage.getItem('oshocks_data_source');
    const storedOverride = localStorage.getItem('oshocks_data_source_manual');

    if (stored && storedOverride === 'true') {
      this.currentKey = stored;
      this.manualOverride = true;
    } else {
      this.currentKey = this.detectEnvironment();
      this.manualOverride = false;
    }

    this.listeners = new Set();
    this.hybridSource = null;
  }

  detectEnvironment() {
    const hostname = window.location.hostname;
    const port = window.location.port;

    if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '3000' || port === '8000') {
      return ENVIRONMENTS.LOCAL;
    }
    return ENVIRONMENTS.PRODUCTION;
  }

  async testConnection(url, timeout = 3000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      return { available: response.ok, responseTime: performance.now() };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }

  async detectBestSource() {
    console.log('🔍 Testing connections...');
    
    const localTest = await this.testConnection('http://localhost:8000/api/v1');
    const prodTest = await this.testConnection('https://oshocks-backend-production.up.railway.app/api/v1');

    console.log('📡 Results:', { local: localTest, production: prodTest });

    if (localTest.available && prodTest.available) {
      return { source: ENVIRONMENTS.LOCAL, reason: 'both-available-prefer-local' };
    }
    if (localTest.available) {
      return { source: ENVIRONMENTS.LOCAL, reason: 'local-only' };
    }
    if (prodTest.available) {
      return { source: ENVIRONMENTS.PRODUCTION, reason: 'production-only' };
    }
    return { source: ENVIRONMENTS.LOCAL, reason: 'fallback-prefer-local' };
  }

  getCurrentSource() {
    if (this.currentKey === ENVIRONMENTS.HYBRID) {
      return this.hybridSource || DEFAULT_SOURCES[ENVIRONMENTS.LOCAL];
    }
        return DEFAULT_SOURCES[this.currentKey] || DEFAULT_SOURCES[ENVIRONMENTS.LOCAL];
  }

  getApiUrl() {
    const source = this.getCurrentSource();
    return source.apiUrl || DEFAULT_SOURCES[ENVIRONMENTS.LOCAL].apiUrl;
  }

  async switchSource(key) {
    if (!DEFAULT_SOURCES[key]) return false;
    if (this.currentKey === key) return true;

    if (key === ENVIRONMENTS.HYBRID) {
      const best = await this.detectBestSource();
      this.hybridSource = {
        ...DEFAULT_SOURCES[best.source],
        name: `Hybrid (${DEFAULT_SOURCES[best.source].name})`,
        hybridReason: best.reason
      };
      console.log('🔄 Hybrid activated:', best);
    }

    const oldKey = this.currentKey;
    this.currentKey = key;
    this.manualOverride = true;

    localStorage.setItem('oshocks_data_source', key);
    localStorage.setItem('oshocks_data_source_manual', 'true');

    this.notifyListeners({
      oldSource: oldKey,
      newSource: key,
      source: this.getCurrentSource(),
      timestamp: new Date().toISOString()
    });

    window.dispatchEvent(new CustomEvent('data-source-changed', {
      detail: { source: key, ...this.getCurrentSource() }
    }));

    return true;
  }

  resetToAuto() {
    this.manualOverride = false;
    this.currentKey = this.detectEnvironment();
    this.hybridSource = null;
    localStorage.removeItem('oshocks_data_source');
    localStorage.removeItem('oshocks_data_source_manual');

    this.notifyListeners({
      oldSource: null,
      newSource: this.currentKey,
      source: DEFAULT_SOURCES[this.currentKey],
      autoDetected: true
    });
    return true;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(changeInfo) {
    this.listeners.forEach(cb => {
      try { cb(changeInfo); } catch (e) { console.error('Listener error:', e); }
    });
  }

  isManualOverride() { return this.manualOverride; }
  getAllSources() { return DEFAULT_SOURCES; }
  getCurrentKey() { return this.currentKey; }
  isLocal() { return this.currentKey === ENVIRONMENTS.LOCAL; }
  isHybrid() { return this.currentKey === ENVIRONMENTS.HYBRID; }
  isProduction() { return this.currentKey === ENVIRONMENTS.PRODUCTION; }
}

const dataSourceManager = new DataSourceManager();
export { dataSourceManager, ENVIRONMENTS, DEFAULT_SOURCES };
export default dataSourceManager;
