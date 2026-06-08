import { useState } from 'react';
import { ChevronDown, ChevronUp, Package, AlertTriangle, Check, Plus, Minus } from 'lucide-react';

/**
 * ResourceCategorySection — Collapsible category with resource cards
 * Shows availability status, conflict checking, and selection UI
 */
const ResourceCategorySection = ({ 
  category, 
  resources, 
  selectedResources, 
  onAdd, 
  onRemove, 
  onQuantityChange,
  eventDurationDays,
  participants,
  isLoading 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedMap = new Map(selectedResources.map(r => [r.resourceItem.id, r.quantity]));

  const getAvailabilityStatus = (resource) => {
    if (!resource.is_available) {
      return { status: 'unavailable', text: 'Fully Booked', class: 'bg-red-100 text-red-700' };
    }
    if (resource.is_backorder) {
      return { status: 'backorder', text: 'Backorder', class: 'bg-yellow-100 text-yellow-700' };
    }
    if (resource.available_for_request <= (resource.low_stock_threshold || 5)) {
      return { status: 'low', text: resource.remaining_alert || `Only ${resource.available_for_request} left`, class: 'bg-orange-100 text-orange-700' };
    }
    return { status: 'available', text: 'Available', class: 'bg-green-100 text-green-700' };
  };

  const getCategoryIcon = () => {
    const icons = {
      helmet: '🪖',
      bike_light: '💡',
      u_lock: '🔒',
      repair_kit: '🔧',
      water_bottle: '💧',
      gloves: '🧤',
      cycling_kit: '👕',
      pump: '💨',
      nutrition_pack: '🍫',
      insurance: '🛡️',
      transport: '🚐',
      mechanic_service: '🔩',
      default: '📦'
    };
    return icons[category] || icons.default;
  };

  const formatCategoryName = (cat) => {
    return cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (resources.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{getCategoryIcon()}</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{formatCategoryName(category)}</h3>
            <p className="text-xs text-gray-500">{resources.length} item{resources.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedMap.size > 0 && (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
              {Array.from(selectedMap.values()).reduce((a, b) => a + b, 0)} selected
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      {/* Resources Grid */}
      {isExpanded && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resources.map(resource => {
                const status = getAvailabilityStatus(resource);
                const isSelected = selectedMap.has(resource.id);
                const currentQty = selectedMap.get(resource.id) || 0;
                const maxAvailable = Math.min(resource.available_for_request || 0, resource.total_quantity || 999);
                const canAddMore = isSelected ? currentQty < maxAvailable : maxAvailable > 0;

                // Calculate price for this resource
                const unitPrice = resource.current_price || resource.base_price || 0;
                const itemTotal = unitPrice * (isSelected ? currentQty : 1) * eventDurationDays;

                return (
                  <div 
                    key={resource.id}
                    className={`relative rounded-xl border-2 transition-all overflow-hidden ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50' 
                        : status.status === 'unavailable'
                          ? 'border-gray-200 opacity-50'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-32 bg-gray-100">
                      <img 
                        src={resource.images?.[0] || '/placeholder-resource.jpg'} 
                        alt={resource.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.class}`}>
                          {status.text}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {resource.surge_multiplier > 1.0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                          +{Math.round((resource.surge_multiplier - 1) * 100)}% surge
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{resource.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{resource.description}</p>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-lg font-bold text-gray-900">KSh {unitPrice.toLocaleString()}</span>
                          <span className="text-xs text-gray-400">/day</span>
                        </div>
                        {isSelected && (
                          <span className="text-sm font-bold text-orange-600">
                            KSh {itemTotal.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Brand/Model */}
                      {(resource.brand || resource.model) && (
                        <p className="text-xs text-gray-400 mb-2">
                          {resource.brand} {resource.model}
                        </p>
                      )}

                      {/* Quantity selector if selected */}
                      {isSelected ? (
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => onQuantityChange(resource.id, currentQty - 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold text-gray-900 w-8 text-center">{currentQty}</span>
                          <button
                            onClick={() => canAddMore && onQuantityChange(resource.id, currentQty + 1)}
                            disabled={!canAddMore}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-gray-400 ml-1">
                            of {maxAvailable} available
                          </span>
                        </div>
                      ) : null}

                      {/* Add/Remove Button */}
                      {status.status !== 'unavailable' && (
                        <button
                          onClick={() => {
                            if (isSelected) {
                              onRemove(resource.id);
                            } else {
                              onAdd(resource, 1);
                            }
                          }}
                          className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                            isSelected
                              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          {isSelected ? 'Remove' : (
                            <span className="flex items-center justify-center gap-1">
                              <Plus className="w-4 h-4" />
                              Add to Booking
                            </span>
                          )}
                        </button>
                      )}

                      {status.status === 'unavailable' && (
                        <div className="w-full py-2 bg-gray-100 rounded-lg text-center text-xs text-gray-500 font-medium">
                          Not Available for Selected Dates
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceCategorySection;
