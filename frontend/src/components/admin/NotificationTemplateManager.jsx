import React, { useState, useEffect } from 'react';
import { 
  Plus, Copy, Trash2, Edit2, Eye, Save, X, 
  Search, Filter, RefreshCw, CheckCircle, AlertCircle 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = {
  order: 'Order Notifications',
  payment: 'Payment Notifications',
  inventory: 'Inventory Alerts',
  security: 'Security Alerts',
  audit: 'Audit/Admin Alerts',
  marketing: 'Marketing/Promotions',
  loyalty: 'Loyalty Program',
  support: 'Customer Support',
  system: 'System Notifications',
  general: 'General',
};

const CHANNELS = [
  { key: 'in_app', label: 'In-App', color: 'bg-blue-100 text-blue-700' },
  { key: 'email', label: 'Email', color: 'bg-purple-100 text-purple-700' },
  { key: 'push', label: 'Push', color: 'bg-green-100 text-green-700' },
  { key: 'sms', label: 'SMS', color: 'bg-orange-100 text-orange-700' },
];

const PRIORITIES = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

const NotificationTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const [formData, setFormData] = useState({
    template_key: '',
    name: '',
    description: '',
    title: '',
    message: '',
    channels: ['in_app'],
    priority: 'normal',
    icon_type: '',
    icon_color: '',
    icon_bg: '',
    action_text: '',
    category: 'general',
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
  }, [search, categoryFilter]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const response = await api.get('/admin/notification-templates', { params });
      setTemplates(response.data.data.data || []);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/admin/notification-templates/${editingTemplate.id}`, formData);
        toast.success('Template updated successfully');
      } else {
        await api.post('/admin/notification-templates', formData);
        toast.success('Template created successfully');
      }
      setShowModal(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach(err => {
          toast.error(err[0]);
        });
      } else {
        toast.error('Failed to save template');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await api.delete(`/admin/notification-templates/${id}`);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleDuplicate = async (template) => {
    const newKey = `${template.template_key}_copy_${Date.now()}`;
    const newName = `${template.name} (Copy)`;
    
    try {
      await api.post(`/admin/notification-templates/${template.id}/duplicate`, {
        template_key: newKey,
        name: newName,
      });
      toast.success('Template duplicated');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const handlePreview = async (template) => {
    try {
      const response = await api.post(`/admin/notification-templates/${template.id}/preview`);
      setPreviewData(response.data.data);
    } catch (error) {
      toast.error('Failed to load preview');
    }
  };

  const handleSync = async () => {
    try {
      const response = await api.post('/admin/notification-templates/sync-from-config');
      toast.success(response.data.message);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to sync templates');
    }
  };

  const resetForm = () => {
    setFormData({
      template_key: '',
      name: '',
      description: '',
      title: '',
      message: '',
      channels: ['in_app'],
      priority: 'normal',
      icon_type: '',
      icon_color: '',
      icon_bg: '',
      action_text: '',
      category: 'general',
      is_active: true,
    });
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      template_key: template.template_key,
      name: template.name,
      description: template.description || '',
      title: template.title,
      message: template.message,
      channels: template.channels,
      priority: template.priority,
      icon_type: template.icon_type || '',
      icon_color: template.icon_color || '',
      icon_bg: template.icon_bg || '',
      action_text: template.action_text || '',
      category: template.category,
      is_active: template.is_active,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Templates</h1>
          <p className="text-gray-500">Manage email, push, and in-app notification templates</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Sync from Config
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-xl shadow-sm border ${
                template.is_active ? 'border-gray-200' : 'border-gray-300 opacity-75'
              } overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITIES[template.priority].color}`}>
                      {PRIORITIES[template.priority].label}
                    </span>
                    {!template.is_active && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePreview(template)}
                      className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(template)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-xs text-gray-500 mb-3 font-mono">{template.template_key}</p>
                
                {template.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {template.channels.map((channel) => {
                    const ch = CHANNELS.find(c => c.key === channel);
                    return ch ? (
                      <span key={channel} className={`px-2 py-0.5 rounded text-xs font-medium ${ch.color}`}>
                        {ch.label}
                      </span>
                    ) : null;
                  })}
                </div>

                <div className="text-xs text-gray-400">
                  Category: {CATEGORIES[template.category] || template.category} • 
                  v{template.version} • 
                  {template.source === 'database' ? 'DB' : 'Config'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Key *
                  </label>
                  <input
                    type="text"
                    value={formData.template_key}
                    onChange={(e) => setFormData({...formData, template_key: e.target.value})}
                    disabled={!!editingTemplate}
                    placeholder="order_placed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier, e.g., order_placed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Order Placed Notification"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title * (use {{variables}})
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="🎉 Order {{order.number}} Confirmed!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message * (use {{variables}})
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={4}
                  placeholder="Your order {{order.number}} has been placed..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    {Object.entries(CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    {Object.entries(PRIORITIES).map(([key, {label}]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Text
                  </label>
                  <input
                    type="text"
                    value={formData.action_text}
                    onChange={(e) => setFormData({...formData, action_text: e.target.value})}
                    placeholder="View Order"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channels *
                </label>
                <div className="flex gap-3">
                  {CHANNELS.map((channel) => (
                    <label key={channel.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes(channel.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, channels: [...formData.channels, channel.key]});
                          } else {
                            setFormData({...formData, channels: formData.channels.filter(c => c !== channel.key)});
                          }
                        }}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-700">{channel.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon Type
                  </label>
                  <input
                    type="text"
                    value={formData.icon_type}
                    onChange={(e) => setFormData({...formData, icon_type: e.target.value})}
                    placeholder="ShoppingBag"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon Color
                  </label>
                  <input
                    type="text"
                    value={formData.icon_color}
                    onChange={(e) => setFormData({...formData, icon_color: e.target.value})}
                    placeholder="text-emerald-600"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon BG
                  </label>
                  <input
                    type="text"
                    value={formData.icon_bg}
                    onChange={(e) => setFormData({...formData, icon_bg: e.target.value})}
                    placeholder="bg-emerald-100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active (available for use)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Template Preview</h2>
              <button
                onClick={() => setPreviewData(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Parsed Title</label>
                <p className="text-lg font-medium text-gray-900">{previewData.parsed_title}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Parsed Message</label>
                <p className="text-gray-700">{previewData.parsed_message}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Sample Variables Used</label>
                <div className="space-y-1">
                  {Object.entries(previewData.sample_data).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{'{{'}{key}{'}}'}</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTemplateManager;
