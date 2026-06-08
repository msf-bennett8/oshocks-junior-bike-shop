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
      <div className="grid grid-cols-1 gap-2">
        {selectedResources.map(({ resourceItem, quantity }) => {
          const unitPrice = resourceItem.current_price || resourceItem.base_price || 0;
          const totalPrice = unitPrice * quantity * eventDurationDays;
          const isLowStock = resourceItem.available_quantity <= (resourceItem.low_stock_threshold || 5);

          return (
            <div
              key={resourceItem.id}
              className={`p-3 rounded-xl border-2 transition-all ${
                isLowStock
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-white border-gray-200 hover:border-orange-300'
              }`}
            >
              {/* Row 1: Name + Remove */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Package className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isLowStock ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold text-gray-900 leading-tight">
                    {resourceItem.name}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(resourceItem.id)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors flex-shrink-0 -mt-0.5 -mr-0.5"
                  title="Remove this item"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>

              {/* Row 2: Description */}
              <p className="text-xs text-gray-500 ml-6 mb-2">
                {quantity} × {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''} × KSh {unitPrice.toLocaleString()}
                {isLowStock && (
                  <span className="text-orange-600 ml-1 font-medium">(Low stock)</span>
                )}
              </p>

              {/* Row 3: Actions + Price */}
              <div className="flex items-center justify-between ml-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onQuantityChange(resourceItem.id, quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-sm font-bold text-gray-900 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => onQuantityChange(resourceItem.id, quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                <span className="text-sm font-bold text-orange-600">
                  KSh {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedResourceChips;
