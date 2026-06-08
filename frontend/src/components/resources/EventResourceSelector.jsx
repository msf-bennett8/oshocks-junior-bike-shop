import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { X, Search, Package, Loader, AlertCircle, ChevronLeft, Check, Minus, Plus, Shield } from 'lucide-react';
import resourceService from '../../services/resourceService';
import ResourceCategorySection from './ResourceCategorySection';
import SelectedResourceChips from './SelectedResourceChips';
import toast from 'react-hot-toast';

/**
 * EventResourceSelector — Modal with draggable bottom sheet preview
 * Matches BikeSelectionModal layout exactly
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);
  
  // Bottom sheet state
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartExpanded = useRef(false);

  // Sync with parent state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedResources(initialSelectedResources);
      setPreviewExpanded(false);
    }
  }, [isOpen, initialSelectedResources]);

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

  const hasSelectedItems = selectedResources.length > 0 || selectedBike;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] lg:h-auto lg:max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Equipment & Services
            </h2>
            <p className="text-sm text-gray-500">
              {event?.title} • {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''} • {participants} rider{participants > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
          {/* Left: Resource List */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-32 lg:pb-6">
            
            {/* Search & Filters */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search equipment, services..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">No equipment available</h3>
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

          {/* ─── BOTTOM SHEET PREVIEW (Mobile) / SIDE PANEL (Desktop) ─── */}
          {hasSelectedItems && (
            <>
              {/* Mobile: Draggable Bottom Sheet */}
              <div 
                className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.25)] flex flex-col will-change-transform"
                style={{
                  height: previewExpanded ? '75vh' : 'auto',
                  transition: isDragging ? 'none' : 'height 0.3s ease-out',
                }}
              >
                {/* ─── DRAGGABLE HEADER ─── */}
                <div 
                  className="flex-shrink-0 select-none relative touch-none"
                  onTouchStart={(e) => {
                    setIsDragging(true);
                    dragStartY.current = e.touches[0].clientY;
                    dragStartExpanded.current = previewExpanded;
                  }}
                  onTouchMove={(e) => {
                    if (!isDragging) return;
                    const delta = dragStartY.current - e.touches[0].clientY;
                    if (delta > 50 && !dragStartExpanded.current) {
                      setPreviewExpanded(true);
                    } else if (delta < -50 && dragStartExpanded.current) {
                      setPreviewExpanded(false);
                    }
                  }}
                  onTouchEnd={() => setIsDragging(false)}
                  onClick={() => !isDragging && setPreviewExpanded(!previewExpanded)}
                >
                  {/* Drag Pill */}
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-orange-500 rounded-full" />
                  </div>

                  {/* Side Border Indicators - visible when collapsed */}
                  {!previewExpanded && (
                    <>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                        <div className="w-0.5 h-8 bg-gradient-to-b from-transparent via-orange-400 to-transparent rounded-full" />
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                        <div className="w-0.5 h-8 bg-gradient-to-b from-transparent via-orange-400 to-transparent rounded-full" />
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                      </div>
                    </>
                  )}

                  {/* Summary Bar */}
                  <div className="px-5 pb-4">
                    <div className="flex items-center gap-4">
                      {selectedBike && (
                        <img 
                          src={selectedBike.images?.[0] || selectedBike.photos?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                          alt={selectedBike.name} 
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0" 
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base truncate">
                          {selectedResources.length > 0 ? `${selectedResources.length} item${selectedResources.length !== 1 ? 's' : ''} selected` : 'Selected Bike'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedBike ? `${selectedBike.brand} ${selectedBike.model}` : 'No bike selected'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-orange-600">
                          KSh {grandTotal.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {previewExpanded ? 'Swipe down ↓' : 'Swipe up ↑'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── EXPANDABLE CONTENT ─── */}
                <div 
                  className="flex-1 overflow-y-auto bg-white transition-opacity duration-300"
                  style={{
                    opacity: previewExpanded ? 1 : 0,
                    maxHeight: previewExpanded ? 'calc(75vh - 80px)' : 0,
                    overflow: previewExpanded ? 'auto' : 'hidden',
                  }}
                >
                  <div className="p-5 space-y-5">
                    
                    {/* Selected Items */}
                    <SelectedResourceChips
                      selectedResources={selectedResources}
                      onRemove={removeResource}
                      onQuantityChange={updateResourceQuantity}
                      eventDurationDays={eventDurationDays}
                    />

                    {/* Bike Summary */}
                    {selectedBike && (
                      <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Selected Bike</h4>
                        <div className="flex items-center gap-4 mb-3">
                          <img
                            src={selectedBike.images?.[0] || selectedBike.photos?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
                            alt={selectedBike.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{selectedBike.name}</p>
                            <p className="text-sm text-gray-500">{selectedBike.brand} {selectedBike.model}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase">
                                {selectedBike.frame_size}
                              </span>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full capitalize">
                                {selectedBike.condition || 'good'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Daily Rate</span>
                            <span className="font-semibold">KSh {(selectedBike.daily_rate || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Bike Rental Total</span>
                            <span className="font-bold text-orange-600">KSh {bikeRentalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h4 className="font-bold text-gray-900 mb-4 text-base">Price Summary</h4>
                      {selectedBike && (
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Bike Rental</span>
                          <span className="font-medium">KSh {bikeRentalPrice.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedResources.length > 0 && (
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Equipment & Services</span>
                          <span className="font-medium">KSh {resourcesTotalPrice.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t-2 border-gray-200 pt-3 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-gray-900">Total Added</span>
                          <span className="text-orange-600">KSh {grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <button
                      onClick={handleConfirm}
                      className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-6 h-6" />
                      {selectedResources.length > 0
                        ? `Confirm ${selectedResources.length} Item${selectedResources.length !== 1 ? 's' : ''}`
                        : 'Skip & Continue'
                      }
                    </button>

                    <button
                      onClick={onClose}
                      className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop: Side Panel (always expanded) */}
              <div className="hidden lg:flex w-96 border-l border-gray-200 bg-gray-50 flex-col overflow-y-auto">
                <div className="p-6 space-y-6">
                  <h3 className="font-bold text-gray-900 text-lg">Selected Items</h3>

                  {/* Selected Items */}
                  <SelectedResourceChips
                    selectedResources={selectedResources}
                    onRemove={removeResource}
                    onQuantityChange={updateResourceQuantity}
                    eventDurationDays={eventDurationDays}
                  />

                  {/* Bike Summary */}
                  {selectedBike && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Selected Bike</h4>
                      <div className="flex items-center gap-4 mb-3">
                        <img
                          src={selectedBike.images?.[0] || selectedBike.photos?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
                          alt={selectedBike.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{selectedBike.name}</p>
                          <p className="text-sm text-gray-500">{selectedBike.brand} {selectedBike.model}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''} × {participants} = {' '}
                        <span className="font-bold text-gray-900">KSh {bikeRentalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h4 className="font-bold text-gray-900 mb-4">Price Summary</h4>
                    {selectedBike && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Bike Rental</span>
                        <span className="font-medium">KSh {bikeRentalPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedResources.length > 0 && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Equipment & Services</span>
                        <span className="font-medium">KSh {resourcesTotalPrice.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-gray-200 pt-3 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Added</span>
                        <span className="text-orange-600">KSh {grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleConfirm}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-6 h-6" />
                    {selectedResources.length > 0
                      ? `Confirm ${selectedResources.length} Item${selectedResources.length !== 1 ? 's' : ''}`
                      : 'Skip & Continue'
                    }
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventResourceSelector;