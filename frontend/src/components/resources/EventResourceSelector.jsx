import { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Search, Package, Loader, AlertCircle, ChevronLeft, Check } from 'lucide-react';
import resourceService from '../../services/resourceService';
import ResourceCategorySection from './ResourceCategorySection';
import SelectedResourceChips from './SelectedResourceChips';
import toast from 'react-hot-toast';

/**
 * EventResourceSelector — Modal/Page for selecting resources & equipment during event booking
 * 
 * Features:
 * - Loads real resources from database with conflict checking
 * - Groups by category (helmet, lights, locks, etc.)
 * - Shows real-time availability for event date range
 * - Selected items appear as removable chips
 * - Running price calculation
 * - Industry best practice: Modal on desktop, full page on mobile
 */
const EventResourceSelector = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  event, 
  participants = 1,
  initialSelectedResources = [],
  selectedBike = null
}) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResources, setSelectedResources] = useState(initialSelectedResources);

  // Sync with parent state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedResources(initialSelectedResources);
    }
  }, [isOpen, initialSelectedResources]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'asset', 'ancillary'
  const [error, setError] = useState(null);

  // Event date range
  const startDatetime = event?.start_datetime;
  const endDatetime = event?.end_datetime;
  const eventDurationDays = useMemo(() => {
    if (!startDatetime || !endDatetime) return 1;
    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [startDatetime, endDatetime]);

  // Fetch available resources with conflict checking
  useEffect(() => {
    if (!isOpen || !startDatetime || !endDatetime) return;

    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          quantity: participants,
          per_page: 100,
        };

        const response = await resourceService.getAvailableResources(startDatetime, endDatetime, params);
        const items = response.data?.data || [];
        setResources(items);
      } catch (err) {
        console.error('Failed to fetch available resources:', err);
        setError('Failed to load available equipment. Please try again.');
        toast.error('Failed to load equipment availability');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [isOpen, startDatetime, endDatetime, participants]);

  // Group resources by category
  const groupedResources = useMemo(() => {
    const filtered = resources.filter(r => {
      const matchesSearch = !searchQuery || 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.brand?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = activeFilter === 'all' || r.resource_type === activeFilter;
      
      return matchesSearch && matchesType;
    });

    return filtered.reduce((acc, resource) => {
      const cat = resource.category || 'uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(resource);
      return acc;
    }, {});
  }, [resources, searchQuery, activeFilter]);

  // ─── Resource Management ───
  const addResource = useCallback((resourceItem, quantity = 1) => {
    setSelectedResources(prev => {
      const existing = prev.find(r => r.resourceItem.id === resourceItem.id);
      if (existing) {
        // Replace quantity instead of adding (parent manages the truth)
        return prev.map(r =>
          r.resourceItem.id === resourceItem.id ? { ...r, quantity } : r
        );
      }
      return [...prev, { resourceItem, quantity, price: resourceItem.current_price || resourceItem.base_price }];
    });
  }, []);

  const removeResource = useCallback((resourceId) => {
    setSelectedResources(prev => prev.filter(r => r.resourceItem.id !== resourceId));
  }, []);

  const updateResourceQuantity = useCallback((resourceId, quantity) => {
    if (quantity <= 0) {
      removeResource(resourceId);
      return;
    }
    setSelectedResources(prev => prev.map(r => 
      r.resourceItem.id === resourceId ? { ...r, quantity } : r
    ));
  }, [removeResource]);

  // ─── Pricing ───
  const resourcesTotalPrice = useMemo(() => {
    return selectedResources.reduce((sum, item) => {
      const unitPrice = item.resourceItem.current_price || item.resourceItem.base_price || 0;
      return sum + (unitPrice * item.quantity * eventDurationDays);
    }, 0);
  }, [selectedResources, eventDurationDays]);

  const bikeRentalPrice = useMemo(() => {
    if (!selectedBike) return 0;
    return (selectedBike.daily_rate || 0) * eventDurationDays * participants;
  }, [selectedBike, eventDurationDays, participants]);

  const grandTotal = resourcesTotalPrice + bikeRentalPrice;

  // ─── Confirm Selection ───
  const handleConfirm = useCallback(() => {
    onConfirm({
      resources: selectedResources,
      resourcesTotalPrice,
      grandTotal
    });
    onClose();
  }, [selectedResources, resourcesTotalPrice, grandTotal, onConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[100vh] md:max-h-[90vh] bg-white md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Equipment & Services
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                {event?.title} • {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''} • {participants} rider{participants > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left: Resource List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            
            {/* Search & Filters */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search equipment, services..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { key: 'all', label: 'All', count: resources.length },
                  { key: 'asset', label: 'Equipment', count: resources.filter(r => r.resource_type === 'asset').length },
                  { key: 'ancillary', label: 'Services', count: resources.filter(r => r.resource_type === 'ancillary').length },
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      activeFilter === filter.key
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-sm font-semibold text-red-600 hover:underline ml-auto"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-orange-500 mb-3" />
                <p className="text-sm text-gray-500">Checking availability...</p>
              </div>
            ) : Object.keys(groupedResources).length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No equipment available</h3>
                <p className="text-gray-500 text-sm">
                  {searchQuery ? 'Try a different search term' : 'All equipment is booked for these dates'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(groupedResources).map(([category, categoryResources]) => (
                  <ResourceCategorySection
                    key={category}
                    category={category}
                    resources={categoryResources}
                    selectedResources={selectedResources}
                    onAdd={addResource}
                    onRemove={removeResource}
                    onQuantityChange={updateResourceQuantity}
                    eventDurationDays={eventDurationDays}
                    participants={participants}
                    isLoading={loading}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Summary Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50 shrink-0 overflow-y-auto">
            <div className="p-4 md:p-5 space-y-4">
              
              {/* Selected Items */}
              <SelectedResourceChips
                selectedResources={selectedResources}
                onRemove={removeResource}
                onQuantityChange={updateResourceQuantity}
                eventDurationDays={eventDurationDays}
              />

              {/* Bike Summary */}
              {selectedBike && (
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected Bike</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={selectedBike.images?.[0] || selectedBike.photos?.[0]?.url || '/placeholder-bike.jpg'} 
                      alt={selectedBike.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedBike.name}</p>
                      <p className="text-xs text-gray-500">KSh {(selectedBike.daily_rate || 0).toLocaleString()}/day</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''} × {participants} = {' '}
                    <span className="font-bold text-gray-900">KSh {bikeRentalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Summary</h4>
                
                {selectedBike && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Bike Rental</span>
                    <span className="font-medium">KSh {bikeRentalPrice.toLocaleString()}</span>
                  </div>
                )}
                
                {selectedResources.length > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Equipment & Services</span>
                    <span className="font-medium">KSh {resourcesTotalPrice.toLocaleString()}</span>
                  </div>
                )}

                {(selectedBike || selectedResources.length > 0) && (
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Added to Booking</span>
                      <span className="text-orange-600">KSh {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {!selectedBike && selectedResources.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">
                    Select equipment or services to see pricing
                  </p>
                )}
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {selectedResources.length > 0 
                  ? `Confirm ${selectedResources.length} Item${selectedResources.length !== 1 ? 's' : ''}`
                  : 'Skip & Continue'
                }
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventResourceSelector;
