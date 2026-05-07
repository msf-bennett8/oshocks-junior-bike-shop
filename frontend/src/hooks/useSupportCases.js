import { useState, useEffect, useCallback, useRef } from 'react';
import supportCaseService from '../services/supportCaseService';
import { useWebSocket } from './useWebSocket';

export const useSupportCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const { subscribeToChannel } = useWebSocket();

  // Fetch user's support cases
  const fetchMyCases = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await supportCaseService.getMyCases(params);
      setCases(res.data.data?.data || res.data.data || []);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cases');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch queue (admin/agent)
  const fetchQueue = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await supportCaseService.getQueue(params);
      setCases(res.data.data?.data || res.data.data || []);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch queue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch queue stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await supportCaseService.getQueueStats();
      setStats(res.data.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch queue stats:', err);
    }
  }, []);

  // Claim case
  const claimCase = useCallback(async (caseId) => {
    const res = await supportCaseService.claimCase(caseId);
    setCases(prev => prev.map(c => c.case_id === caseId ? { ...c, ...res.data.data } : c));
    return res.data;
  }, []);

  // Assign case
  const assignCase = useCallback(async (caseId, agentId) => {
    const res = await supportCaseService.assignCase(caseId, agentId);
    setCases(prev => prev.map(c => c.case_id === caseId ? { ...c, ...res.data.data } : c));
    return res.data;
  }, []);

  // Resolve case
  const resolveCase = useCallback(async (caseId, resolutionNotes) => {
    const res = await supportCaseService.resolveCase(caseId, resolutionNotes);
    setCases(prev => prev.filter(c => c.case_id !== caseId));
    return res.data;
  }, []);

  // Close case
  const closeCase = useCallback(async (caseId) => {
    const res = await supportCaseService.closeCase(caseId);
    setCases(prev => prev.filter(c => c.case_id !== caseId));
    return res.data;
  }, []);

  // Escalate case
  const escalateCase = useCallback(async (caseId, reason) => {
    const res = await supportCaseService.escalateCase(caseId, reason);
    setCases(prev => prev.map(c => c.case_id === caseId ? { ...c, ...res.data.data } : c));
    return res.data;
  }, []);

  // Create case
  const createCase = useCallback(async (data) => {
    const res = await supportCaseService.createCase(data);
    setCases(prev => [res.data.data?.support_case || res.data.data, ...prev]);
    return res.data;
  }, []);

  // Real-time updates
  useEffect(() => {
    if (typeof subscribeToChannel !== 'function') return;
    
    const unsub = subscribeToChannel('support-queue', 'support-case.updated', (payload) => {
      setCases(prev => prev.map(c =>
        c.case_id === payload.case_id ? { ...c, ...payload } : c
      ));
    });
    
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [subscribeToChannel]);

  return {
    cases,
    loading,
    error,
    stats,
    fetchMyCases,
    fetchQueue,
    fetchStats,
    claimCase,
    assignCase,
    resolveCase,
    closeCase,
    escalateCase,
    createCase,
  };
};

export default useSupportCases;
