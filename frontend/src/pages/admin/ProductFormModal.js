import React, { useState, useEffect } from 'react';
import { X, Upload, ImageIcon, Loader, AlertCircle, Check } from 'lucide-react';

const ProductFormModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create' or 'edit'
  product = null, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'bike',
    category_id: '',
    brand_id: '',
    price: '',
    stock_quantity: '',
    condition: 'new',
    year: new Date().getFullYear(),
    specifications: {
      frame_material: '',
      wheel_size: '',
      gear_system: '',
      brake_type: '',
      weight: '',
      color: ''
    }
  });

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        type: product.type || 'bike',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        price: product.price || '',
        stock_quantity: product.stock_quantity || product.quantity || '',
        condition: product.condition || 'new',
        year: product.year || new Date().getFullYear(),
        specifications: product.specifications || {
          frame_material: '',
          wheel_size: '',
          gear_system: '',
          brake_type: '',
          weight: '',
          color: ''
        }
      });
    }
  }, [mode, product]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/categories');
      const data = await response.json();
      setCategories(data.data || data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecificationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get auth token (adjust based on your auth implementation)
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Please login first');
      }

      const url = mode === 'edit' 
        ? `http://127.0.0.1:8000/api/v1/seller/products/${product.id}`
        : 'http://127.0.0.1:8000/api/v1/seller/products';

      const method = mode === 'edit' ? 'PUT' : 'POST';

      // Clean up specifications - remove empty values
      const cleanedSpecs = Object.entries(formData.specifications)
        .reduce((acc, [key, value]) => {
          if (value && value.trim() !== '') {
            acc[key] = value;
          }
          return acc;
        }, {});

      const payload = {
        ...formData,
        specifications: Object.keys(cleanedSpecs).length > 0 ? cleanedSpecs : null,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        year: formData.year ? parseInt(formData.year) : null,
        category_id: parseInt(formData.category_id),
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      const result = await response.json();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      // Reset form
      resetForm();
      onClose();

    } catch (err) {
      setError(err.message);
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'bike',
      category_id: '',
      brand_id: '',
      price: '',
      stock_quantity: '',
      condition: 'new',
      year: new Date().getFullYear(),
      specifications: {
        frame_material: '',
        wheel_size: '',
        gear_system: '',
        brake_type: '',
        weight: '',
        color: ''
      }
    });
    setImagePreview(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Mountain Bike Pro X5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bike">Bike</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year (Optional)
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    placeholder={new Date().getFullYear().toString()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Detailed product description..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing & Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (KES) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g., 125000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="e.g., 10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Specifications (Optional) */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Specifications (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frame Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Material
                  </label>
                  <input
                    type="text"
                    name="frame_material"
                    value={formData.specifications.frame_material}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., Aluminum, Carbon Fiber"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Wheel Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wheel Size
                  </label>
                  <input
                    type="text"
                    name="wheel_size"
                    value={formData.specifications.wheel_size}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., 27.5 inches, 29 inches"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Gear System */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gear System
                  </label>
                  <input
                    type="text"
                    name="gear_system"
                    value={formData.specifications.gear_system}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., Shimano 21-speed"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Brake Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brake Type
                  </label>
                  <input
                    type="text"
                    name="brake_type"
                    value={formData.specifications.brake_type}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., Hydraulic Disc"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.specifications.weight}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., 13.5 kg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.specifications.color}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., Red, Black, Blue"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  {mode === 'create' ? 'Create Product' : 'Update Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;