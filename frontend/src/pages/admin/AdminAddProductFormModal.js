import React, { useState, useEffect } from 'react';
import { X, Upload, ImageIcon, Loader, AlertCircle, Check, Plus, Trash2 } from 'lucide-react';

const AdminAddProductFormModal = ({ 
  isOpen, 
  onClose, 
  mode = 'create', // 'create' or 'edit'
  product = null, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [previewColorIndex, setPreviewColorIndex] = useState(0);
  
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
    },
    sizes: [
      { id: 1, name: 'Small (15")', value: 'S', available: true, recommended: '' },
      { id: 2, name: 'Medium (17")', value: 'M', available: true, recommended: '' },
      { id: 3, name: 'Large (19")', value: 'L', available: true, recommended: '' },
      { id: 4, name: 'XL (21")', value: 'XL', available: true, recommended: '' }
    ],
    keyFeatures: [{ id: 1, text: '' }],
    colors: [{ name: '', images: [] }]
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
        },
        sizes: product.sizes || [
          { id: 1, name: 'Small (15")', value: 'S', available: true, recommended: '' },
          { id: 2, name: 'Medium (17")', value: 'M', available: true, recommended: '' },
          { id: 3, name: 'Large (19")', value: 'L', available: true, recommended: '' },
          { id: 4, name: 'XL (21")', value: 'XL', available: true, recommended: '' }
        ],
        keyFeatures: product.keyFeatures || [{ id: 1, text: '' }],
        colors: product.colors || [{ name: '', images: [] }]
      });
    }
  }, [mode, product]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://oshocks-junior-bike-shop-backend.onrender.com/api/v1/categories');
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

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData(prev => ({
      ...prev,
      sizes: newSizes
    }));
  };

  const handleKeyFeatureChange = (index, value) => {
    const newFeatures = [...formData.keyFeatures];
    newFeatures[index].text = value;
    setFormData(prev => ({
      ...prev,
      keyFeatures: newFeatures
    }));
  };

  const addKeyFeature = () => {
    const newId = Math.max(...formData.keyFeatures.map(f => f.id), 0) + 1;
    setFormData(prev => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, { id: newId, text: '' }]
    }));
  };

  const removeKeyFeature = (id) => {
    if (formData.keyFeatures.length > 1) {
      setFormData(prev => ({
        ...prev,
        keyFeatures: prev.keyFeatures.filter(f => f.id !== id)
      }));
    }
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData(prev => ({
      ...prev,
      colors: newColors
    }));
  };

  const handleImageUpload = (e, colorIndex) => {
    const files = Array.from(e.target.files);
    const newColors = [...formData.colors];
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          newColors[colorIndex].images.push({
            id: Date.now() + Math.random(),
            src: event.target.result,
            file: file,
            isNew: true
          });
          setFormData(prev => ({
            ...prev,
            colors: newColors
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (colorIndex, imageId) => {
    const newColors = [...formData.colors];
    newColors[colorIndex].images = newColors[colorIndex].images.filter(img => img.id !== imageId);
    setFormData(prev => ({
      ...prev,
      colors: newColors
    }));
  };

  const addColorVariant = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', images: [] }]
    }));
  };

  const removeColorVariant = (index) => {
    if (formData.colors.length > 1) {
      setFormData(prev => ({
        ...prev,
        colors: prev.colors.filter((_, i) => i !== index)
      }));
      if (previewColorIndex >= formData.colors.length - 1) {
        setPreviewColorIndex(Math.max(0, previewColorIndex - 1));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name.trim()) {
        throw new Error('Please enter product name');
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('Please enter valid price');
      }
      if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
        throw new Error('Please enter valid stock quantity');
      }

      const hasEmptyColors = formData.colors.some(c => !c.name.trim());
      if (hasEmptyColors) {
        throw new Error('Please name all color variants');
      }

      const hasNoImages = formData.colors.some(c => c.images.length === 0);
      if (hasNoImages) {
        throw new Error('Each color variant needs at least one image');
      }

      // Get auth token
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Please login first');
      }

      const url = mode === 'edit' 
        ? `${process.env.REACT_APP_API_URL}/api/v1/seller/products/${product.id}`
        : `${process.env.REACT_APP_API_URL}/api/v1/seller/products`;

      const method = mode === 'edit' ? 'PUT' : 'POST';

      // Clean up specifications
      const cleanedSpecs = Object.entries(formData.specifications)
        .reduce((acc, [key, value]) => {
          if (value && value.trim() !== '') {
            acc[key] = value;
          }
          return acc;
        }, {});

      // Prepare FormData for file upload
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('description', formData.description);
      submitFormData.append('type', formData.type);
      submitFormData.append('category_id', formData.category_id);
      submitFormData.append('brand_id', formData.brand_id || '');
      submitFormData.append('price', parseFloat(formData.price));
      submitFormData.append('stock_quantity', parseInt(formData.stock_quantity));
      submitFormData.append('condition', formData.condition);
      submitFormData.append('year', formData.year ? parseInt(formData.year) : null);
      submitFormData.append('specifications', JSON.stringify(Object.keys(cleanedSpecs).length > 0 ? cleanedSpecs : null));
      submitFormData.append('sizes', JSON.stringify(formData.sizes));
      submitFormData.append('keyFeatures', JSON.stringify(formData.keyFeatures.filter(f => f.text.trim())));

      // Append color variants and their images
      formData.colors.forEach((color, colorIndex) => {
        submitFormData.append(`colors[${colorIndex}][name]`, color.name);
        
        color.images.forEach((image, imageIndex) => {
          if (image.isNew && image.file) {
            submitFormData.append(`colors[${colorIndex}][images][${imageIndex}]`, image.file);
          } else if (image.url) {
            // For existing images during edit
            submitFormData.append(`colors[${colorIndex}][existing_images][${imageIndex}]`, image.url);
          }
        });
      });

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: submitFormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      const result = await response.json();
      
      if (onSuccess) {
        onSuccess(result);
      }

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
      },
      sizes: [
        { id: 1, name: 'Small (15")', value: 'S', available: true, recommended: '' },
        { id: 2, name: 'Medium (17")', value: 'M', available: true, recommended: '' },
        { id: 3, name: 'Large (19")', value: 'L', available: true, recommended: '' },
        { id: 4, name: 'XL (21")', value: 'XL', available: true, recommended: '' }
      ],
      keyFeatures: [{ id: 1, text: '' }],
      colors: [{ name: '', images: [] }]
    });
    setPreviewColorIndex(0);
    setError(null);
  };

  if (!isOpen) return null;

  const currentColor = formData.colors[previewColorIndex];

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
            {/* Step 1: Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                Basic Information
              </h3>
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

            {/* Step 2: Pricing & Inventory */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                Pricing & Inventory
              </h3>
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

            {/* Step 3: Specifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                Specifications (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frame Material</label>
                  <input
                    type="text"
                    name="frame_material"
                    value={formData.specifications.frame_material}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., Aluminum, Carbon Fiber"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wheel Size</label>
                  <input
                    type="text"
                    name="wheel_size"
                    value={formData.specifications.wheel_size}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., 27.5 inches, 29 inches"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gear System</label>
                  <input
                    type="text"
                    name="gear_system"
                    value={formData.specifications.gear_system}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., Shimano 21-speed"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brake Type</label>
                  <input
                    type="text"
                    name="brake_type"
                    value={formData.specifications.brake_type}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., Hydraulic Disc"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.specifications.weight}
                    onChange={handleSpecificationChange}
                    placeholder="e.g., 13.5 kg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
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
            
            {/* Step 4: Frame Sizes */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
                Frame Sizes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.sizes.map((size, index) => (
                  <div key={size.id} className="border border-gray-300 rounded-lg p-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size Name
                      </label>
                      <input
                        type="text"
                        value={size.name}
                        onChange={(e) => handleSizeChange(index, 'name', e.target.value)}
                        placeholder='e.g., Small (15")'
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size Value
                      </label>
                      <input
                        type="text"
                        value={size.value}
                        onChange={(e) => handleSizeChange(index, 'value', e.target.value)}
                        placeholder="e.g., S, M, L, XL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        maxLength="3"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommended Height Range
                      </label>
                      <input
                        type="text"
                        value={size.recommended}
                        onChange={(e) => handleSizeChange(index, 'recommended', e.target.value)}
                        placeholder="e.g., 5'4&quot; - 5'8&quot;"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={size.available}
                        onChange={(e) => handleSizeChange(index, 'available', e.target.checked)}
                        className="w-4 h-4"
                        id={`available-${size.id}`}
                      />
                      <label htmlFor={`available-${size.id}`} className="text-sm text-gray-700">
                        Available
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
            {/* Step 5: Key Features */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">5</span>
                Key Features
              </h3>
              <div className="space-y-3">
                {formData.keyFeatures.map((feature, index) => (
                  <div key={feature.id} className="flex items-start gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={feature.text}
                        onChange={(e) => handleKeyFeatureChange(index, e.target.value)}
                        placeholder="Enter a key feature..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {feature.text && index === formData.keyFeatures.length - 1 && (
                        <button
                          type="button"
                          onClick={addKeyFeature}
                          className="mt-2 flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                        >
                          <Plus size={16} /> Add Feature
                        </button>
                      )}
                    </div>
                    {formData.keyFeatures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyFeature(feature.id)}
                        className="mt-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 6: Color Variants & Images */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">6</span>
                Color Variants & Images
              </h3>

              {/* Color Tabs */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {formData.colors.map((color, index) => (
                  <div key={index} className="relative">
                    <button
                      type="button"
                      onClick={() => setPreviewColorIndex(index)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        previewColorIndex === index
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {color.name || `Color ${index + 1}`}
                    </button>
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColorVariant(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addColorVariant}
                  className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 flex items-center gap-2"
                >
                  <Plus size={18} /> Add Color
                </button>
              </div>

              {/* Color Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentColor.name}
                    onChange={(e) => handleColorChange(previewColorIndex, 'name', e.target.value)}
                    placeholder="e.g., Red, Blue, Black, Silver"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Images for {currentColor.name || 'this color'} <span className="text-red-500">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                    <Upload size={32} className="text-blue-500 mb-2" />
                    <span className="text-gray-700 font-semibold">Click to select images</span>
                    <span className="text-sm text-gray-500 mt-1">You can select multiple images at once</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, previewColorIndex)}
                      className="hidden"
                    />
                  </label>

                  {/* Image Preview Grid */}
                  {currentColor.images.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Images ({currentColor.images.length})</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {currentColor.images.map((image, idx) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.src}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-40 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(previewColorIndex, image.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                            >
                              <X size={16} />
                            </button>
                            <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                              {idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 7: Review & Summary */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">7</span>
                Review & Summary
              </h3>

              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-sm text-gray-700 mb-4"><strong>Product Summary:</strong></p>
                <div className="space-y-2 text-sm">
                  <p>📦 <strong>{formData.name || 'Product Name'}</strong> - {formData.type}</p>
                  <p>💰 KES {formData.price || '0'} × {formData.stock_quantity || '0'} units in stock</p>
                  <p>📂 Category: {categories.find(c => c.id == formData.category_id)?.name || 'Not selected'}</p>
                  <p>🎨 Color Variants: {formData.colors.length}</p>
                  <p>📸 Total Images: {formData.colors.reduce((sum, c) => sum + c.images.length, 0)}</p>
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

export default AdminAddProductFormModal;