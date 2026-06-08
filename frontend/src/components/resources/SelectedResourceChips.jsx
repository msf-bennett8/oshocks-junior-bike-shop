import { X, Package, AlertTriangle } from 'lucide-react';

/**
 * SelectedResourceChips — Displays selected resources as removable chips
 * Shows: resource name, quantity, price, and X to remove
 */
const SelectedResourceChips = ({ selectedResources, onRemove, onQuantityChange, eventDurationDays }) => {
  if (selectedResources.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Selected Equipment</h4>
      <div className="flex flex-wrap gap-2">
        {selectedResources.map(({ resourceItem, quantity }) => {
          const unitPrice = resourceItem.current_price || resourceItem.base_price || 0;
          const totalPrice = unitPrice * quantity * eventDurationDays;
          const isLowStock = resourceItem.available_quantity <= (resourceItem.low_stock_threshold || 5);

          return (
            <div 
              key={resourceItem.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                isLowStock 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-white border-gray-200 hover:border-orange-300'
              }`}
            >
              <Package className={`w-4 h-4 ${isLowStock ? 'text-orange-500' : 'text-gray-400'}`} />
              
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 leading-tight">
                  {resourceItem.name}
                </span>
                <span className="text-xs text-gray-500">
                  {quantity} × {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''} × KSh {unitPrice.toLocaleString()}
                </span>
              </div>

              {isLowStock && (
                <AlertTriangle className="w-3 h-3 text-orange-500" title="Low stock" />
              )}

              <div className="flex items-center gap-1 ml-1">
                {/* Quantity controls */}
                <button
                  onClick={() => onQuantityChange(resourceItem.id, quantity - 1)}
                  className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs transition-colors"
                >
                  −
                </button>
                <span className="text-xs font-bold text-gray-700 w-4 text-center">{quantity}</span>
                <button
                  onClick={() => onQuantityChange(resourceItem.id, quantity + 1)}
                  className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xs transition-colors"
                >
                  +
                </button>
              </div>

              <span className="text-xs font-bold text-orange-600">
                KSh {totalPrice.toLocaleString()}
              </span>

              {/* Remove button */}
              <button
                onClick={() => onRemove(resourceItem.id)}
                className="ml-1 p-1 hover:bg-red-100 rounded-full transition-colors group-hover:opacity-100 opacity-70"
                title="Remove this item"
              >
                <X className="w-3 h-3 text-red-500" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedResourceChips;
