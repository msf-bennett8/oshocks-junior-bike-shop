import React, { useState, useMemo } from 'react';
import { X, Search, Filter, MapPin, Star, Shield, Check, Bike, ArrowRight, Heart, Clock, Info } from 'lucide-react';
import { MOCK_BIKES, BIKE_CATEGORY_CONFIG, FRAME_SIZE_CONFIG } from '../../data/cyclingMockData';

const BikeSelectionModal = ({ isOpen, onClose, onSelect, event, participants = 1 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedCategorySize] = useState('all');
  const [selectedBike, setSelectedBike] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState({
    helmet: true,
    lights: false,
    lock: false,
    repair_kit: false,
    water_bottle: false,
    gloves: false
  });
  const [insuranceOptIn, setInsuranceOptIn] = useState(true);
  const [frameSize, setFrameSize] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
    return MOCK_BIKES.filter(bike => {
      const matchesSearch = !searchQuery || 
        bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || bike.category === selectedCategory;
      const matchesSize = selectedSize === 'all' || bike.frame_size === selectedSize;
      const matchesTerrain = suitableCategories.includes(bike.category);
      const isAvailable = bike.is_active && bike.is_verified;
      return matchesSearch && matchesCategory && matchesSize && matchesTerrain && isAvailable;
    });
  }, [searchQuery, selectedCategory, selectedSize, suitableCategories]);

  // Calculate event duration in days
  const eventDurationDays = useMemo(() => {
    if (!event) return 1;
    const start = new Date(event.start_datetime);
    const end = new Date(event.end_datetime);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [event]);

  // Calculate total for a bike
  const calculateBikeTotal = (bike) => {
    const baseRental = bike.daily_rate * eventDurationDays * participants;
    const addOnsTotal = Object.entries(selectedAddOns).reduce((sum, [key, checked]) => {
      if (!checked) return sum;
      const prices = { helmet: 200, lights: 150, lock: 100, repair_kit: 100, water_bottle: 50, gloves: 150 };
      return sum + (prices[key] || 0) * participants;
    }, 0);
    const insurance = insuranceOptIn ? 200 * eventDurationDays * participants : 0;
    const deposit = bike.security_deposit * participants;
    return { baseRental, addOnsTotal, insurance, deposit, grandTotal: baseRental + addOnsTotal + insurance };
  };

  const handleSelectBike = (bike) => {
    setSelectedBike(bike);
    // Auto-select frame size if not set
    if (!frameSize) setFrameSize(bike.frame_size);
  };

  const handleConfirm = () => {
    if (!selectedBike) return;
    const totals = calculateBikeTotal(selectedBike);
    onSelect({
      bike: selectedBike,
      frameSize: frameSize || selectedBike.frame_size,
      addOns: selectedAddOns,
      insurance: insuranceOptIn,
      ...totals
    });
    onClose();
  };

  const toggleAddOn = (key) => {
    setSelectedAddOns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addOnPrices = { helmet: 200, lights: 150, lock: 100, repair_kit: 100, water_bottle: 50, gloves: 150 };
  const addOnLabels = { helmet: 'Helmet', lights: 'Bike Lights', lock: 'U-Lock', repair_kit: 'Repair Kit', water_bottle: 'Water Bottle', gloves: 'Cycling Gloves' };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Your Bike</h2>
            <p className="text-sm text-gray-500">
              {event?.title} • {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''} • {participants} rider{participants > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left: Bike List */}
          <div className="flex-1 overflow-y-auto p-6">
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

                {/* Category quick filters */}
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
                        onClick={() => setSelectedCategorySize('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedSize === 'all' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                        }`}
                      >
                        Any
                      </button>
                      {['xs', 's', 'm', 'l', 'xl', 'xxl'].map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedCategorySize(size)}
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
                  return (
                    <button
                      key={bike.id}
                      onClick={() => handleSelectBike(bike)}
                      className={`relative text-left rounded-xl border-2 transition-all overflow-hidden ${
                        isSelected 
                          ? 'border-orange-500 ring-2 ring-orange-200 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      {/* Selection Badge */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 z-10 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className="relative h-40">
                        <img src={bike.images[0]} alt={bike.name} className="w-full h-full object-cover" />
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
                            {bike.rating}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {bike.location_address.split(',')[0]}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {bike.features.slice(0, 3).map((f, i) => (
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
                          <span className="text-xs text-gray-500">{bike.total_rentals} rentals</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No bikes found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>

          {/* Right: Details & Add-ons */}
          {selectedBike && (
            <div className="w-full lg:w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto p-6">
              <h3 className="font-bold text-gray-900 mb-4">Selected Bike</h3>
              
              {/* Selected Bike Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <img src={selectedBike.images[0]} alt={selectedBike.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-gray-900">{selectedBike.name}</p>
                    <p className="text-sm text-gray-500">{selectedBike.brand} {selectedBike.model}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frame Size</span>
                    <span className="font-semibold uppercase">{selectedBike.frame_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-semibold capitalize">{selectedBike.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Rate</span>
                    <span className="font-semibold">KSh {selectedBike.daily_rate.toLocaleString()}</span>
                  </div>
                </div>

                {/* Frame Size Selector (if different from bike size) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Frame Size</label>
                  <select
                    value={frameSize}
                    onChange={(e) => setFrameSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {['xs', 's', 'm', 'l', 'xl', 'xxl'].map(size => (
                      <option key={size} value={size}>{size.toUpperCase()}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">We'll match you with the right size</p>
                </div>
              </div>

              {/* Add-ons */}
              <h3 className="font-bold text-gray-900 mb-4">Add-on Equipment</h3>
              <div className="space-y-3 mb-6">
                {Object.entries(addOnLabels).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddOns[key] ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddOns[key]}
                      onChange={() => toggleAddOn(key)}
                      className="w-5 h-5 text-orange-500 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">+KSh {addOnPrices[key].toLocaleString()}</span>
                  </label>
                ))}
              </div>

              {/* Insurance */}
              <div className="mb-6">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  insuranceOptIn ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={insuranceOptIn}
                    onChange={(e) => setInsuranceOptIn(e.target.checked)}
                    className="w-5 h-5 text-green-500 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Ride Insurance</p>
                    <p className="text-xs text-gray-500">Theft, damage & accident coverage</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">+KSh {(200 * eventDurationDays * participants).toLocaleString()}</span>
                </label>
              </div>

              {/* Deposit Notice */}
              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">Security Deposit</p>
                    <p className="text-sm text-yellow-700">
                      KSh {(selectedBike.security_deposit * participants).toLocaleString()} held during rental. Released when bike is returned in good condition.
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <h4 className="font-bold text-gray-900 mb-3">Price Breakdown</h4>
                {(() => {
                  const totals = calculateBikeTotal(selectedBike);
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bike Rental ({eventDurationDays} days × {participants})</span>
                        <span className="font-medium">KSh {totals.baseRental.toLocaleString()}</span>
                      </div>
                      {totals.addOnsTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Add-ons</span>
                          <span className="font-medium">KSh {totals.addOnsTotal.toLocaleString()}</span>
                        </div>
                      )}
                      {totals.insurance > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Insurance</span>
                          <span className="font-medium">KSh {totals.insurance.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>Total Added to Booking</span>
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
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Confirm Bike Selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BikeSelectionModal;