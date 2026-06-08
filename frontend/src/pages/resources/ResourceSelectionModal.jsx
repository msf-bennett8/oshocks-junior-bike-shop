import { useState, useEffect } from 'react';
import {
  X, Package, Check, Plus, Minus, AlertTriangle, Loader,
  Wrench, DollarSign, ChevronRight
} from 'lucide-react';
import resourceService from '../../services/resourceService';
import { useToast } from '../common/ToastContainer';

const ResourceSelectionModal = ({ 
  isOpen, 
  onClose, 
  bookingType, // 'bike' or 'event'
  bookingId, // bike_rental_booking_id or event_id
  startDate, 
  endDate, 
  onConfirm,
  preSelectedResources = []
}) => {
  const toast = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResources, setSelectedResources] = useState(preSelectedResources);
  const [quantities, setQuantities] = useState({});
  const [activeTab, setActiveTab] = useState('asset');

  useEffect(() => {
    if (isOpen) {
      fetchResources();
    }
  }, [isOpen, startDate, endDate, activeTab]);

  const fetchResources = async () => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      const params = {
        start_datetime: startDate,
        end_datetime: endDate,
        resource_type: activeTab,
        quantity: 1,
      };
      
      // If booking type is event, add event_id filter
      if (bookingType === 'event' && bookingId) {
        params.event_id = bookingId;
      }

      const response = await resourceService.getAvailableResources(startDate, endDate, params);
      setResources(response.data?.data || []);
    } catch (err) {
      toast.error('Failed to load available resources');
    } finally {
      setLoading(false);
    }
  };

  const toggleResource = (resource) => {
    const exists = selectedResources.find(r => r.id === resource.id);
    if (exists) {
      setSelectedResources(prev => prev.filter(r => r.id !== resource.id));
      setQuantities(prev => {
        const next = { ...prev };
        delete next[resource.id];
        return next;
      });
    } else {
      setSelectedResources(prev => [...prev, { ...resource, quantity: 1 }]);
      setQuantities(prev => ({ ...prev, [resource.id]: 1 }));
    }
  };

  const updateQuantity = (resourceId, delta) => {
    setQuantities(prev => {
      const current = prev[resourceId] || 1;
      const resource = resources.find(r => r.id === resourceId);
      const max = resource?.available_for_request || 1;
      const next = Math.max(1, Math.min(max, current + delta));
      return { ...prev, [resourceId]: next };
    });
    
    setSelectedResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, quantity: quantities[resourceId] || 1 } : r
    ));
  };

  const calculateTotal = () => {
    return selectedResources.reduce((total, resource) => {
      const qty = quantities[resource.id] || 1;
      return total + (resource.current_price * qty);
    }, 0);
  };

  const handleConfirm = () => {
    const finalSelection = selectedResources.map(r => ({
      ...r,
      quantity: quantities[r.id] || 1,
      total_price: r.current_price * (quantities[r.id] || 1),
    }));
    onConfirm(finalSelection);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              Add Resources
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Select equipment and services for your {bookingType === 'bike' ? 'bike rental' : 'event'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('asset')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'asset'
                ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Wrench className="w-4 h-4 inline mr-1" />
            Equipment (Assets)
          </button>
          <button
            onClick={() => setActiveTab('ancillary')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'ancillary'
                ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4 inline mr-1" />
            Services (Ancillary)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No {activeTab} resources available for selected dates
            </div>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => {
                const isSelected = selectedResources.find(r => r.id === resource.id);
                const qty = quantities[resource.id] || 1;
                
                return (
                  <div
                    key={resource.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleResource(resource)}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={resource.images?.[0] || '/placeholder-resource.jpg'}
                        alt={resource.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{resource.category.replace(/_/g, ' ')}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-900">KSh {Number(resource.current_price).toLocaleString()}</span>
                            {resource.surge_multiplier > 1.0 && (
                              <span className="text-orange-600 text-xs ml-1">({resource.surge_multiplier}x surge)</span>
                            )}
                          </div>
                          
                          {resource.is_low_stock && (
                            <span className="text-xs text-orange-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {resource.remaining_alert}
                            </span>
                          )}
                        </div>

                        {/* Quantity selector when selected */}
                        {isSelected && (
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-purple-200">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateQuantity(resource.id, -1); }}
                              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-semibold w-8 text-center">{qty}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateQuantity(resource.id, 1); }}
                              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-500">
                              Max: {resource.available_for_request}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">{selectedResources.length} items selected</p>
              <p className="text-lg font-bold text-gray-900">
                Total: KSh {Number(calculateTotal()).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedResources.length === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                Add to Booking
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceSelectionModal;
