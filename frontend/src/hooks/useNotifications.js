// ============================================================================
// USE NOTIFICATIONS HOOK - Manage notification state and real-time updates
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  
  const pollingRef = useRef(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  /**
   * Fetch notifications with pagination
   */
  const fetchNotifications = useCallback(async (params = {}, reset = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentPage = reset ? 1 : page;
      const response = await notificationService.getNotifications({
        ...params,
        page: currentPage,
        per_page: 15,
      });

      const { data, meta } = response;
      
      setNotifications(prev => reset ? data : [...prev, ...data]);
      setHasMore(currentPage < meta.last_page);
      setUnreadCount(meta.unread_count || 0);
      
      // Calculate urgent count from notifications
      const urgent = data.filter(n => n.priority === 'urgent' && !n.is_read).length;
      setUrgentCount(urgent);
      
      if (!reset) {
        setPage(currentPage + 1);
      } else {
        setPage(2);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  /**
   * Refresh unread count only
   */
  const refreshUnreadCount = useCallback(async () => {
    try {
      const { unread_count, urgent_count } = await notificationService.getUnreadCount();
      setUnreadCount(unread_count);
      setUrgentCount(urgent_count);
    } catch (err) {
      console.error('Failed to refresh unread count:', err);
    }
  }, []);

  /**
   * Load more notifications (infinite scroll)
   */
  const loadMore = useCallback((params = {}) => {
    if (!loading && hasMore) {
      fetchNotifications(params);
    }
  }, [loading, hasMore, fetchNotifications]);

  /**
   * Refresh all notifications
   */
  const refresh = useCallback(async (params = {}) => {
    setPage(1);
    await fetchNotifications(params, true);
  }, [fetchNotifications]);

  // ============================================================================
  // NOTIFICATION ACTIONS
  // ============================================================================

  /**
   * Mark notification as read (optimistic update)
   */
  const markAsRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      // Revert on error
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: false, read_at: null } : n)
      );
      setUnreadCount(prev => prev + 1);
      toast.error('Failed to mark as read');
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async (type = null) => {
    const previousNotifications = [...notifications];
    
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);
    setUrgentCount(0);

    try {
      const result = await notificationService.markAllAsRead(type);
      toast.success(`${result.count} notifications marked as read`);
    } catch (err) {
      // Revert
      setNotifications(previousNotifications);
      refreshUnreadCount();
      toast.error('Failed to mark all as read');
    }
  }, [notifications, refreshUnreadCount]);

  /**
   * Delete notification (optimistic)
   */
  const deleteNotification = useCallback(async (id) => {
    const previousNotifications = [...notifications];
    const deleted = notifications.find(n => n.id === id);
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (deleted && !deleted.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await notificationService.deleteNotification(id);
      toast.success('Notification deleted');
    } catch (err) {
      setNotifications(previousNotifications);
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => prev + 1);
      }
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  /**
   * Archive notification
   */
  const archiveNotification = useCallback(async (id) => {
    const previousNotifications = [...notifications];
    
    // Optimistic update - remove from list and unpin if pinned
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_archived: true, is_pinned: false } : n)
    );

    try {
      await notificationService.archiveNotification(id);
      toast.success('Notification archived');
    } catch (err) {
      setNotifications(previousNotifications);
      toast.error('Failed to archive notification');
    }
  }, [notifications]);

  /**
   * Unarchive notification
   */
  const unarchiveNotification = useCallback(async (id) => {
    const previousNotifications = [...notifications];
    
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_archived: false } : n)
    );

    try {
      await notificationService.unarchiveNotification(id);
      toast.success('Notification unarchived');
    } catch (err) {
      setNotifications(previousNotifications);
      toast.error('Failed to unarchive notification');
    }
  }, [notifications]);

  /**
   * Pin/unpin notification
   */
  const togglePin = useCallback(async (id, isPinned) => {
    const previousNotifications = [...notifications];
    
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_pinned: !isPinned } : n)
    );

    try {
      if (isPinned) {
        await notificationService.unpinNotification(id);
      } else {
        await notificationService.pinNotification(id);
      }
    } catch (err) {
      setNotifications(previousNotifications);
      toast.error('Failed to update pin status');
    }
  }, [notifications]);

  /**
   * Bulk delete
   */
  const bulkDelete = useCallback(async (ids) => {
    const previousNotifications = [...notifications];
    const deletedCount = notifications.filter(n => ids.includes(n.id) && !n.is_read).length;
    
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    setUnreadCount(prev => Math.max(0, prev - deletedCount));

    try {
      const result = await notificationService.bulkDeleteNotifications(ids);
      toast.success(`${result.count} notifications deleted`);
    } catch (err) {
      setNotifications(previousNotifications);
      setUnreadCount(prev => prev + deletedCount);
      toast.error('Failed to delete notifications');
    }
  }, [notifications]);

  /**
   * Bulk archive
   */
  const bulkArchive = useCallback(async (ids) => {
    const previousNotifications = [...notifications];
    
    setNotifications(prev => 
      prev.map(n => ids.includes(n.id) ? { ...n, is_archived: true, is_pinned: false } : n)
    );

    try {
      const result = await notificationService.bulkArchiveNotifications(ids);
      toast.success(`${result.count} notifications archived`);
    } catch (err) {
      setNotifications(previousNotifications);
      toast.error('Failed to archive notifications');
    }
  }, [notifications]);

  /**
   * Bulk mark as read
   */
  const bulkMarkAsRead = useCallback(async (ids) => {
    const previousNotifications = [...notifications];
    const readCount = notifications.filter(n => ids.includes(n.id) && !n.is_read).length;
    
    setNotifications(prev => 
      prev.map(n => ids.includes(n.id) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - readCount));

    try {
      const result = await notificationService.bulkMarkAsRead(ids);
      toast.success(`${result.count} notifications marked as read`);
    } catch (err) {
      setNotifications(previousNotifications);
      setUnreadCount(prev => prev + readCount);
      toast.error('Failed to mark notifications as read');
    }
  }, [notifications]);

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  /**
   * Start polling for unread count
   */
  const startPolling = useCallback((interval = 30000) => {
    // Clear existing
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    // Initial fetch
    refreshUnreadCount();
    
    // Set up polling
    pollingRef.current = setInterval(refreshUnreadCount, interval);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [refreshUnreadCount]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    // State
    notifications,
    unreadCount,
    urgentCount,
    loading,
    hasMore,
    error,
    page,
    
    // Actions
    fetchNotifications,
    refresh,
    loadMore,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    unarchiveNotification,
    togglePin,
    bulkDelete,
    bulkArchive,
    bulkMarkAsRead,
    
    // Polling
    startPolling,
    stopPolling,
  };
};

export default useNotifications;
