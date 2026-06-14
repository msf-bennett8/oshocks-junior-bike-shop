import { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, Filter, MapPin, Star, Shield, Check, Bike, Clock, Info, Plus, Minus, Package, AlertTriangle } from 'lucide-react';
import bikeService from '../../services/bikeService';
import resourceService from '../../services/resourceService';
import { BIKE_CATEGORY_CONFIG } from '../../data/cyclingMockData';

const BikeSelectionModal = ({ isOpen, onClose, onSelect, event, participants = 1, initialSelectedBike = null, initialSelectedResources = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedBike, setSelectedBike] = useState(initialSelectedBike);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourceAddOns, setResourceAddOns] = useState([]);
  const [selectedResourceAddOns, setSelectedResourceAddOns] = useState(initialSelectedResources);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [insuranceOptIn, setInsuranceOptIn] = useState(true);
  const [frameSize, setFrameSize] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartExpanded = useRef(false);

  // Fetch available bikes WITH conflict checking for event dates
  useEffect(() => {
    if (!isOpen) return;

    const fetchBikes = async () => {
      try {
        setLoading(true);
        
        // Validate event dates before calling availability endpoint
        const start = event?.start_datetime;
        const end = event?.end_datetime;
        const hasValidDates = start && end && !isNaN(new Date(start).getTime()) && !isNaN(new Date(end).getTime());

        let response;
        if (hasValidDates) {
          // Call availability endpoint with positional args (start, end, filters)
          response = await bikeService.getAvailableBikes(start, end, { per_page: 100 });
        } else {
          // Fallback: fetch all approved bikes without date filtering
          response = await bikeService.getBikes({ per_page: 100 });
        }
        
        const bikeData = response.data?.data || response.data || [];
        setBikes(bikeData);
      } catch (err) {
        console.error('Failed to fetch bikes:', err?.response?.data || err.message);
        setBikes([]); // Prevent infinite loading state
      } finally {
        setLoading(false);
      }
    };

    fetchBikes();
  }, [isOpen, event]);

    // Sync initial selected bike/resources when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBike(initialSelectedBike);
      setSelectedResourceAddOns(initialSelectedResources);
    }
  }, [isOpen, initialSelectedBike, initialSelectedResources]);

  // Fetch available resource add-ons from DB (helmets, lights, locks, etc.)
  useEffect(() => {
    if (!isOpen || !event?.start_datetime || !event?.end_datetime) return;

    const fetchResourceAddOns = async () => {
      try {
        setResourceLoading(true);
        const response = await resourceService.getAvailableResources(
          event.start_datetime,
          event.end_datetime,
          { resource_type: 'asset', per_page: 50 }
        );
        const items = response.data?.data || [];
        // Filter to bike-related equipment categories
        const bikeEquipmentCategories = ['helmet', 'bike_light', 'u_lock', 'repair_kit', 'water_bottle', 'gloves', 'cycling_kit', 'pump'];
        setResourceAddOns(items.filter(r => bikeEquipmentCategories.includes(r.category)));
      } catch (err) {
        console.error('Failed to fetch resource add-ons:', err);
      } finally {
        setResourceLoading(false);
      }
    };

    fetchResourceAddOns();
  }, [isOpen, event]);

  // Determine suitable categories based on event terrain
  const suitableCategories = useMemo(() => {
    if (!event) return ['road', 'mtb', 'gravel', 'hybrid', 'ebike'];
    switch (event.terrain) {
      case 'road': return ['road', 'gravel', 'hybrid', 'ebike'];
      case 'gravel': return ['gravel', 'road', 'hybrid', 'ebike'];
      case 'mtb_trail': return ['mtb', 'gravel', 'ebike'];
      case 'mixed': return ['road', 'mtb', 'gravel', 'hybrid', 'ebike'];
      default: return ['road', 'mtb', 'gravel', 'hybrid', 'ebike'];
    }
  }, [event]);

  // Filter bikes
  const filteredBikes = useMemo(() => {
    return bikes.filter(bike => {
      const matchesSearch = !searchQuery ||
        bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || bike.category === selectedCategory;
      const matchesSize = selectedSize === 'all' || (bike.frame_size && bike.frame_size.toLowerCase() === selectedSize.toLowerCase());
      const matchesTerrain = suitableCategories.includes(bike.category);
      // Defensive: backend already filters approved+active; handle missing field gracefully
      const isAvailable = bike.is_available !== false && (!bike.listing_status || bike.listing_status === 'approved');
      return matchesSearch && matchesCategory && matchesSize && matchesTerrain && isAvailable;
    });
  }, [searchQuery, selectedCategory, selectedSize, suitableCategories, bikes]);

  // Calculate event duration in days
  const eventDurationDays = useMemo(() => {
    if (!event) return 1;
    const start = new Date(event.start_datetime);
    const end = new Date(event.end_datetime);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [event]);

  // Calculate total for a bike
  const calculateBikeTotal = (bike) => {
    const baseRental = (bike.daily_rate || 0) * eventDurationDays * participants;
    
    // Calculate resource add-ons from DB
    const resourceAddOnsTotal = selectedResourceAddOns.reduce((sum, item) => {
      const unitPrice = item.resourceItem.current_price || item.resourceItem.base_price || 0;
      return sum + (unitPrice * item.quantity * eventDurationDays);
    }, 0);

    const insurance = insuranceOptIn ? 200 * eventDurationDays * participants : 0;
    const deposit = (bike.security_deposit || 0) * participants;
    return { 
      baseRental, 
      resourceAddOnsTotal,
      insurance, 
      deposit, 
      grandTotal: baseRental + resourceAddOnsTotal + insurance 
    };
  };

  // Resource add-on management
  const toggleResourceAddOn = (resourceItem) => {
    setSelectedResourceAddOns(prev => {
      const existing = prev.find(r => r.resourceItem.id === resourceItem.id);
      if (existing) {
        return prev.filter(r => r.resourceItem.id !== resourceItem.id);
      }
      return [...prev, { resourceItem, quantity: 1, price: resourceItem.current_price || resourceItem.base_price }];
    });
  };

  const updateResourceQuantity = (resourceId, delta) => {
    setSelectedResourceAddOns(prev => prev.map(item => {
      if (item.resourceItem.id === resourceId) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.resourceItem.available_for_request || 999));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleSelectBike = (bike) => {
    setSelectedBike(bike);
    setError(null);
    if (!frameSize) setFrameSize(bike.frame_size);
  };

  const handleConfirm = async () => {
    if (!selectedBike) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const totals = calculateBikeTotal(selectedBike);
      await onSelect({
        bike: selectedBike,
        frameSize: frameSize || selectedBike.frame_size,
        resourceAddOns: selectedResourceAddOns,
        insurance: insuranceOptIn,
        ...totals
      });
      onClose();
    } catch (err) {
      console.error('Bike selection failed:', err);
      setError(err.message || 'Failed to confirm selection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group resource add-ons by category
  const groupedResourceAddOns = useMemo(() => {
    return selectedResourceAddOns.reduce((acc, item) => {
      const cat = item.resourceItem.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [selectedResourceAddOns]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] lg:h-auto lg:max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Error Banner */}
        {error && (
          <div className="mx-4 lg:mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Your Bike</h2>
            <p className="text-sm text-gray-500">
              {event?.title} • {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''} • {participants} rider{participants > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => { setError(null); onClose(); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
          {/* Left: Bike List */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-32 lg:pb-6">
            {/* Search & Filters */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bikes by name or brand..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {suitableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                      selectedCategory === cat ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {showFilters && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Frame Size</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedSize('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedSize === 'all' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                        }`}
                      >
                        Any
                      </button>
                      {['xs', 's', 'm', 'l', 'xl', 'xxl'].map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all uppercase ${
                            selectedSize === size ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500">{filteredBikes.length} bike{filteredBikes.length !== 1 ? 's' : ''} available</p>
            </div>

            {/* Bike Grid */}
            {filteredBikes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredBikes.map(bike => {
                  const isSelected = selectedBike?.id === bike.id;
                  const totals = calculateBikeTotal(bike);
                  const isAvailable = bike.is_available !== false;
                  
                  return (
                    <button
                      key={bike.id}
                      onClick={() => isAvailable ? handleSelectBike(bike) : null}
                      disabled={!isAvailable}
                      className={`relative text-left rounded-xl border-2 transition-all overflow-hidden ${
                        isSelected
                          ? 'border-orange-500 ring-2 ring-orange-200 shadow-lg'
                          : !isAvailable
                            ? 'border-gray-200 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {/* Selection Badge */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}

                      {/* Availability Watermark */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm rounded-xl z-20">
                          <div className="text-center text-white">
                            <Clock className="w-6 h-6 mx-auto mb-1" />
                            <p className="text-xs font-bold">Booked for These Dates</p>
                            {bike.next_available_at && (
                              <p className="text-[10px] opacity-80">Available after {new Date(bike.next_available_at).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="relative h-40">
                        <img src={bike.images?.[0] || bike.photos?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} alt={bike.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center gap-2">
                            {bike.condition === 'new' && (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">NEW</span>
                            )}
                            <span className="px-2 py-0.5 bg-white/90 text-gray-900 text-[10px] font-bold rounded-full uppercase">
                              {bike.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900">{bike.name}</h3>
                            <p className="text-sm text-gray-500">{bike.brand} {bike.model} {bike.year}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3 text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {bike.rating || '4.5'}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {bike.location_address?.split(',')[0] || 'Nairobi'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {(bike.features || bike.bike_features || []).slice(0, 3).map((f, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {f.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-lg font-bold text-orange-600">KSh {totals.baseRental.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">for {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''}</p>
                          </div>
                          <span className="text-xs text-gray-500">{bike.total_rentals || 0} rentals</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No bikes available</h3>
                <p className="text-gray-500">All bikes are booked for these event dates. Try a different event date.</p>
              </div>
            )}
          </div>

          {/* ─── BOTTOM SHEET PREVIEW (Mobile) / SIDE PANEL (Desktop) ─── */}
          {selectedBike && (
            <>
              {/* Mobile: Draggable Bottom Sheet */}
              <div 
                className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col will-change-transform"
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
                    // Swipe up > 50px expands, swipe down > 50px collapses
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
                      <img 
                        src={selectedBike.images?.[0] || selectedBike.photos?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                        alt={selectedBike.name} 
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-base truncate">{selectedBike.name}</p>
                        <p className="text-sm text-gray-500">{selectedBike.brand} {selectedBike.model}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-orange-600">
                          KSh {calculateBikeTotal(selectedBike).grandTotal.toLocaleString()}
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
                  className="flex-1 overflow-y-auto bg-gray-50 transition-opacity duration-300"
                  style={{
                    opacity: previewExpanded ? 1 : 0,
                    maxHeight: previewExpanded ? 'calc(75vh - 80px)' : 0,
                    overflow: previewExpanded ? 'auto' : 'hidden',
                  }}
                >
                  <div className="p-5 space-y-5">
                    
                    {/* Bike Details Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <img src={selectedBike.images?.[0] || selectedBike.photos?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} alt={selectedBike.name} className="w-20 h-20 rounded-xl object-cover" />
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
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Daily Rate</span>
                          <span className="font-semibold">KSh {(selectedBike.daily_rate || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-semibold">{eventDurationDays} day{eventDurationDays > 1 ? 's' : ''} × {participants} rider{participants > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Base Rental</span>
                          <span className="font-bold text-orange-600">KSh {((selectedBike.daily_rate || 0) * eventDurationDays * participants).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Frame Size</label>
                        <select
                          value={frameSize}
                          onChange={(e) => setFrameSize(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {['xs', 's', 'm', 'l', 'xl', 'xxl'].map(size => (
                            <option key={size} value={size}>{size.toUpperCase()}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">We'll match you with the right size</p>
                      </div>
                    </div>

                    {/* Equipment Add-ons */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
                        <Package className="w-5 h-5 text-orange-500" />
                        Equipment Add-ons
                      </h3>
                      
                      {resourceLoading ? (
                        <div className="flex justify-center py-6">
                          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : resourceAddOns.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4">No additional equipment available for these dates</p>
                      ) : (
                        <div className="space-y-3">
                          {resourceAddOns.map(resource => {
                            const isSelected = selectedResourceAddOns.some(r => r.resourceItem.id === resource.id);
                            const selectedItem = selectedResourceAddOns.find(r => r.resourceItem.id === resource.id);
                            const unitPrice = resource.current_price || resource.base_price || 0;
                            const isLowStock = resource.available_for_request <= (resource.low_stock_threshold || 5);

                            return (
                              <div
                                key={resource.id}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleResourceAddOn(resource)}
                                    className="w-5 h-5 text-orange-500 rounded mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-semibold text-gray-900">{resource.name}</p>
                                      <span className="font-bold text-gray-900">KSh {unitPrice.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">{resource.description}</p>
                                    
                                    {isSelected && (
                                      <div className="flex items-center gap-3 mt-2">
                                        <button
                                          onClick={() => updateResourceQuantity(resource.id, -1)}
                                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-base font-bold w-8 text-center">{selectedItem?.quantity || 1}</span>
                                        <button
                                          onClick={() => updateResourceQuantity(resource.id, 1)}
                                          disabled={selectedItem?.quantity >= resource.available_for_request}
                                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30"
                                        >
                                          <Plus className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs text-gray-400">
                                          of {resource.available_for_request} available
                                        </span>
                                      </div>
                                    )}

                                    {isLowStock && !isSelected && (
                                      <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                                        <Info className="w-3 h-3" />
                                        {resource.remaining_alert || `Only ${resource.available_for_request} left`}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Insurance */}
                    <div>
                      <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        insuranceOptIn ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                      }`}>
                        <input
                          type="checkbox"
                          checked={insuranceOptIn}
                          onChange={(e) => setInsuranceOptIn(e.target.checked)}
                          className="w-6 h-6 text-green-500 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-base">Ride Insurance</p>
                          <p className="text-xs text-gray-500">Theft, damage & accident coverage</p>
                        </div>
                        <span className="text-base font-bold text-gray-900">+KSh {(200 * eventDurationDays * participants).toLocaleString()}</span>
                      </label>
                    </div>

                    {/* Deposit Notice */}
                    <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-900 text-sm">Security Deposit</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            KSh {((selectedBike.security_deposit || 0) * participants).toLocaleString()} held during rental. Released when bike is returned in good condition.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h4 className="font-bold text-gray-900 mb-4 text-base">Price Breakdown</h4>
                      {(() => {
                        const totals = calculateBikeTotal(selectedBike);
                        return (
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">Bike Rental</span>
                              <span className="font-medium">KSh {totals.baseRental.toLocaleString()}</span>
                            </div>
                            {totals.resourceAddOnsTotal > 0 && (
                              <div className="flex justify-between py-2">
                                <span className="text-gray-600">Equipment Add-ons</span>
                                <span className="font-medium">KSh {totals.resourceAddOnsTotal.toLocaleString()}</span>
                              </div>
                            )}
                            {totals.insurance > 0 && (
                              <div className="flex justify-between py-2">
                                <span className="text-gray-600">Insurance</span>
                                <span className="font-medium">KSh {totals.insurance.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="border-t-2 border-gray-200 pt-3 mt-2">
                              <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-900">Total Added to Booking</span>
                                <span className="text-orange-600">KSh {totals.grandTotal.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Confirm Button */}
                    <button
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className={`w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-6 h-6" />
                          Confirm Bike Selection
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop: Side Panel (always expanded) */}
              <div className="hidden lg:flex w-96 border-l border-gray-200 bg-gray-50 flex-col overflow-y-auto">
                <div className="p-6 space-y-6">
                  <h3 className="font-bold text-gray-900 text-lg">Selected Bike</h3>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={selectedBike.images?.[0] || selectedBike.photos?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} alt={selectedBike.name} className="w-20 h-20 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{selectedBike.name}</p>
                        <p className="text-sm text-gray-500">{selectedBike.brand} {selectedBike.model}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Frame Size</span>
                        <span className="font-semibold uppercase">{selectedBike.frame_size}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Condition</span>
                        <span className="font-semibold capitalize">{selectedBike.condition || selectedBike.bike_condition}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Daily Rate</span>
                        <span className="font-semibold">KSh {(selectedBike.daily_rate || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Frame Size</label>
                      <select
                        value={frameSize}
                        onChange={(e) => setFrameSize(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
                      >
                        {['xs', 's', 'm', 'l', 'xl', 'xxl'].map(size => (
                          <option key={size} value={size}>{size.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Equipment Add-ons */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-500" />
                      Equipment Add-ons
                    </h3>
                    
                    {resourceLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : resourceAddOns.length === 0 ? (
                      <p className="text-sm text-gray-400">No additional equipment available</p>
                    ) : (
                      <div className="space-y-3">
                        {resourceAddOns.map(resource => {
                          const isSelected = selectedResourceAddOns.some(r => r.resourceItem.id === resource.id);
                          const selectedItem = selectedResourceAddOns.find(r => r.resourceItem.id === resource.id);
                          const unitPrice = resource.current_price || resource.base_price || 0;

                          return (
                            <div
                              key={resource.id}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleResourceAddOn(resource)}
                                  className="w-5 h-5 text-orange-500 rounded mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-gray-900">{resource.name}</p>
                                    <span className="font-bold">KSh {unitPrice.toLocaleString()}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">{resource.description}</p>
                                  
                                  {isSelected && (
                                    <div className="flex items-center gap-3 mt-2">
                                      <button onClick={() => updateResourceQuantity(resource.id, -1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="font-bold w-8 text-center">{selectedItem?.quantity || 1}</span>
                                      <button onClick={() => updateResourceQuantity(resource.id, 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Plus className="w-4 h-4" />
                                      </button>
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

                  {/* Insurance */}
                  <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    insuranceOptIn ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}>
                    <input type="checkbox" checked={insuranceOptIn} onChange={(e) => setInsuranceOptIn(e.target.checked)} className="w-6 h-6 text-green-500 rounded" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Ride Insurance</p>
                      <p className="text-xs text-gray-500">Theft, damage & accident coverage</p>
                    </div>
                    <span className="font-bold">+KSh {(200 * eventDurationDays * participants).toLocaleString()}</span>
                  </label>

                  {/* Deposit */}
                  <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-yellow-900 text-sm">Security Deposit</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          KSh {((selectedBike.security_deposit || 0) * participants).toLocaleString()} held during rental.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h4 className="font-bold text-gray-900 mb-4">Price Breakdown</h4>
                    {(() => {
                      const totals = calculateBikeTotal(selectedBike);
                      return (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bike Rental</span>
                            <span className="font-medium">KSh {totals.baseRental.toLocaleString()}</span>
                          </div>
                          {totals.resourceAddOnsTotal > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Equipment</span>
                              <span className="font-medium">KSh {totals.resourceAddOnsTotal.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="border-t-2 border-gray-200 pt-3">
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <span className="text-orange-600">KSh {totals.grandTotal.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-6 h-6" />
                    Confirm Bike Selection
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

export default BikeSelectionModal;
