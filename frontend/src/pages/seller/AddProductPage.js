import { useState, useRef } from 'react';
import {
  X, Save, Eye, ArrowLeft,
  Check, Plus, Minus, Tag, Package, DollarSign, MapPin,
  Truck, Info, Star, FileText, Zap, ImagePlus, Trash2, ChevronRight 
} from 'lucide-react';

const AddProductPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    productName: '',
    category: '',
    subCategory: '',
    brand: '',
    condition: 'new',
    
    // Pricing
    basePrice: '',
    discountPrice: '',
    discountPercentage: 0,
    costPrice: '',
    
    // Inventory
    sku: '',
    quantity: '',
    minOrderQuantity: 1,
    maxOrderQuantity: '',
    lowStockThreshold: 5,
    
    // Product Details
    shortDescription: '',
    fullDescription: '',
    specifications: [{ key: '', value: '' }],
    features: [''],
    tags: [],
    
    // Shipping
    weight: '',
    length: '',
    width: '',
    height: '',
    freeShipping: false,
    shippingFee: '',
    processingTime: '1-2',
    
    // Images
    images: [],
    
    // Additional
    warranty: '',
    returnPolicy: '7',
    featured: false,
    status: 'active'
  });

  const categories = {
    'Bicycles': ['Mountain Bikes', 'Road Bikes', 'Electric Bikes', 'Kids Bikes', 'BMX Bikes', 'Hybrid Bikes'],
    'Accessories': ['Helmets', 'Lights', 'Locks', 'Bags & Panniers', 'Bottles & Cages', 'Bells & Horns'],
    'Parts': ['Brakes', 'Gears & Shifters', 'Chains', 'Pedals', 'Saddles', 'Wheels & Tires', 'Handlebars'],
    'Clothing': ['Jerseys', 'Shorts', 'Gloves', 'Shoes', 'Jackets', 'Socks'],
    'Tools & Maintenance': ['Repair Kits', 'Pumps', 'Cleaners', 'Lubricants', 'Tools']
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate discount percentage
    if (field === 'basePrice' || field === 'discountPrice') {
      const base = field === 'basePrice' ? parseFloat(value) : parseFloat(formData.basePrice);
      const discount = field === 'discountPrice' ? parseFloat(value) : parseFloat(formData.discountPrice);
      
      if (base && discount && discount < base) {
        const percentage = ((base - discount) / base * 100).toFixed(0);
        setFormData(prev => ({ ...prev, discountPercentage: percentage }));
      }
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            id: Date.now() + Math.random(),
            url: reader.result,
            file: file,
            isPrimary: prev.images.length === 0
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (imageId) => {
    setFormData(prev => {
      const updatedImages = prev.images.filter(img => img.id !== imageId);
      // If primary image was removed, set first image as primary
      if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
        updatedImages[0].isPrimary = true;
      }
      return { ...prev, images: updatedImages };
    });
  };

  // Set primary image
  const setPrimaryImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }))
    }));
  };

  // Handle specifications
  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const updateSpecification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  // Handle features
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feat, i) => i === index ? value : feat)
    }));
  };

  // Handle tags
  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Validation
const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
        if (formData.images.length === 0) newErrors.images = 'At least one image is required';
        break;
      case 2:
        if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) 
          newErrors.basePrice = 'Valid base price is required';
        if (!formData.quantity || parseInt(formData.quantity) < 0) 
          newErrors.quantity = 'Valid quantity is required';
        if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
        break;
      case 3:
        if (!formData.fullDescription.trim()) 
          newErrors.fullDescription = 'Full description is required';
        break;
      default:
        // No validation for other steps
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Product Data:', formData);
      alert('Product added successfully!');
      setLoading(false);
      // Reset form or redirect
    }, 2000);
  };

  // Preview Component
  const ProductPreview = () => (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Product Preview</h2>
        <button
          onClick={() => setPreviewMode(false)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6 grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
            {formData.images.length > 0 && (
              <img
                src={formData.images.find(img => img.isPrimary)?.url || formData.images[0].url}
                alt={formData.productName}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {formData.images.map((img, idx) => (
              <div
                key={img.id}
                className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                  img.isPrimary ? 'border-orange-600' : 'border-transparent'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.productName || 'Product Name'}</h1>
          <p className="text-gray-600 mb-4">{formData.brand && `Brand: ${formData.brand}`}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <div>
              <span className="text-3xl font-bold text-gray-900">
                KSh {(formData.discountPrice || formData.basePrice || 0).toLocaleString()}
              </span>
              {formData.discountPrice && formData.basePrice > formData.discountPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through ml-2">
                    KSh {parseFloat(formData.basePrice).toLocaleString()}
                  </span>
                  <span className="ml-2 bg-red-600 text-white text-sm px-2 py-1 rounded">
                    {formData.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">{formData.shortDescription}</p>
          
          {formData.specifications.filter(s => s.key && s.value).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Specifications</h3>
              <div className="space-y-2">
                {formData.specifications.filter(s => s.key && s.value).map((spec, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{spec.key}:</span>
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-medium">
              Add to Cart
            </button>
            <button className="p-3 border-2 border-gray-300 rounded-lg">
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <ProductPreview />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-600 text-sm mt-1">Fill in the product details to list on marketplace</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Product
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Pricing & Inventory' },
              { num: 3, label: 'Details' },
              { num: 4, label: 'Shipping' }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.num
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                  </div>
                  <span className={`ml-3 font-medium ${
                    currentStep >= step.num ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.num ? 'bg-orange-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  Basic Information
                </h2>
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images * <span className="text-gray-500 font-normal">(Max 10 images, 5MB each)</span>
                </label>
                <div className="grid grid-cols-5 gap-4">
                  {formData.images.map((img) => (
                    <div key={img.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPrimaryImage(img.id)}
                          className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                            img.isPrimary ? 'bg-orange-600' : 'bg-white'
                          }`}
                          title="Set as primary"
                        >
                          <Star className={`w-4 h-4 ${img.isPrimary ? 'text-white fill-white' : 'text-gray-700'}`} />
                        </button>
                        <button
                          onClick={() => removeImage(img.id)}
                          className="p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {img.isPrimary && (
                        <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {formData.images.length < 10 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Add Image</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {errors.images && <p className="text-red-600 text-sm mt-1">{errors.images}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleChange('productName', e.target.value)}
                    placeholder="e.g., Mountain Bike Pro X500 - 21 Speed"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                      errors.productName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.productName && <p className="text-red-600 text-sm mt-1">{errors.productName}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {Object.keys(categories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                </div>

                {/* Sub Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category
                  </label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => handleChange('subCategory', e.target.value)}
                    disabled={!formData.category}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Sub Category</option>
                    {formData.category && categories[formData.category]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleChange('brand', e.target.value)}
                    placeholder="e.g., Trek, Giant, Specialized"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleChange('condition', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="new">New</option>
                    <option value="used-like-new">Used - Like New</option>
                    <option value="used-good">Used - Good</option>
                    <option value="used-fair">Used - Fair</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description * <span className="text-gray-500 font-normal">(Max 200 characters)</span>
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                    placeholder="Brief description that appears in search results and product cards"
                    rows="3"
                    maxLength="200"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                      errors.shortDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.shortDescription && <p className="text-red-600 text-sm">{errors.shortDescription}</p>}
                    <p className="text-sm text-gray-500 ml-auto">{formData.shortDescription.length}/200</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing & Inventory */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  Pricing & Inventory
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Base Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (KSh) *
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => handleChange('basePrice', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="100"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                      errors.basePrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.basePrice && <p className="text-red-600 text-sm mt-1">{errors.basePrice}</p>}
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Price (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => handleChange('discountPrice', e.target.value)}
                    placeholder="Optional"
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  {formData.discountPercentage > 0 && (
                    <p className="text-green-600 text-sm mt-1">
                      {formData.discountPercentage}% discount
                    </p>
                  )}
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => handleChange('costPrice', e.target.value)}
                    placeholder="Your cost"
                    min="0"
                    step="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Only visible to you</p>
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Stock Keeping Unit) *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="e.g., MTB-X500-BLK-2024"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                      errors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.sku && <p className="text-red-600 text-sm mt-1">{errors.sku}</p>}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    placeholder="0"
                    min="0"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                      errors.quantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
                </div>

                {/* Low Stock Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
                    placeholder="5"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Get notified when stock is low</p>
                </div>

                {/* Min Order Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Order Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderQuantity}
                    onChange={(e) => handleChange('minOrderQuantity', e.target.value)}
                    placeholder="1"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Max Order Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Order Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.maxOrderQuantity}
                    onChange={(e) => handleChange('maxOrderQuantity', e.target.value)}
                    placeholder="No limit"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Warranty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Period
                  </label>
                  <select
                    value={formData.warranty}
                    onChange={(e) => handleChange('warranty', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">No Warranty</option>
                    <option value="3-months">3 Months</option>
                    <option value="6-months">6 Months</option>
                    <option value="1-year">1 Year</option>
                    <option value="2-years">2 Years</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              {/* Profit Calculation Display */}
              {formData.basePrice && formData.costPrice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Profit Analysis
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">Selling Price</p>
                      <p className="text-lg font-bold text-blue-900">
                        KSh {(formData.discountPrice || formData.basePrice).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">Cost Price</p>
                      <p className="text-lg font-bold text-blue-900">
                        KSh {parseFloat(formData.costPrice).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">Profit Per Unit</p>
                      <p className="text-lg font-bold text-green-600">
                        KSh {((formData.discountPrice || formData.basePrice) - formData.costPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Product Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Product Details
                </h2>
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description *
                </label>
                <textarea
                  value={formData.fullDescription}
                  onChange={(e) => handleChange('fullDescription', e.target.value)}
                  placeholder="Provide detailed information about the product, including features, benefits, and specifications..."
                  rows="8"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                    errors.fullDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fullDescription && <p className="text-red-600 text-sm mt-1">{errors.fullDescription}</p>}
                <p className="text-sm text-gray-500 mt-1">{formData.fullDescription.length} characters</p>
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specifications
                </label>
                <div className="space-y-3">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        placeholder="e.g., Frame Material"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        placeholder="e.g., Aluminum Alloy"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                      {formData.specifications.length > 1 && (
                        <button
                          onClick={() => removeSpecification(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSpecification}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Specification
                  </button>
                </div>
              </div>

              {/* Key Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features
                </label>
                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="e.g., 21-speed Shimano gear system"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                      {formData.features.length > 1 && (
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-orange-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="tagInput"
                    placeholder="Add tags (e.g., mountain bike, professional)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('tagInput');
                      addTag(input.value.trim());
                      input.value = '';
                    }}
                    className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter or click + to add tags. Tags help customers find your product.</p>
              </div>

              {/* Return Policy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Policy
                </label>
                <select
                  value={formData.returnPolicy}
                  onChange={(e) => handleChange('returnPolicy', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="7">7 Days Return</option>
                  <option value="14">14 Days Return</option>
                  <option value="30">30 Days Return</option>
                  <option value="no-return">No Returns</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Shipping */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-600" />
                  Shipping Information
                </h2>
              </div>

              {/* Package Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Package Dimensions (cm)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      value={formData.length}
                      onChange={(e) => handleChange('length', e.target.value)}
                      placeholder="Length"
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.width}
                      onChange={(e) => handleChange('width', e.target.value)}
                      placeholder="Width"
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleChange('height', e.target.value)}
                      placeholder="Height"
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="0.0"
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Processing Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processing Time
                  </label>
                  <select
                    value={formData.processingTime}
                    onChange={(e) => handleChange('processingTime', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="1-2">1-2 Business Days</option>
                    <option value="3-5">3-5 Business Days</option>
                    <option value="5-7">5-7 Business Days</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Shipping Options */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:border-orange-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.freeShipping}
                    onChange={(e) => handleChange('freeShipping', e.target.checked)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Offer Free Shipping</p>
                    <p className="text-sm text-gray-600">Increase your product visibility and sales</p>
                  </div>
                  <Zap className="w-5 h-5 text-orange-600" />
                </label>
              </div>

              {!formData.freeShipping && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Fee (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.shippingFee}
                    onChange={(e) => handleChange('shippingFee', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              {/* Additional Options */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Additional Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleChange('featured', e.target.checked)}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Feature this product</p>
                      <p className="text-sm text-gray-600">Display prominently on homepage and category pages</p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="active">Active - Visible to customers</option>
                      <option value="draft">Draft - Save for later</option>
                      <option value="inactive">Inactive - Hidden from store</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Product Summary
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-700">Product Name</p>
                    <p className="font-medium text-green-900">{formData.productName || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Category</p>
                    <p className="font-medium text-green-900">{formData.category || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Price</p>
                    <p className="font-medium text-green-900">
                      KSh {(formData.discountPrice || formData.basePrice || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700">Stock Quantity</p>
                    <p className="font-medium text-green-900">{formData.quantity || 0} units</p>
                  </div>
                  <div>
                    <p className="text-green-700">Shipping</p>
                    <p className="font-medium text-green-900">
                      {formData.freeShipping ? 'Free Shipping' : `KSh ${formData.shippingFee || 0}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700">Images</p>
                    <p className="font-medium text-green-900">{formData.images.length} uploaded</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChange('status', 'draft')}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Save as Draft
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Publish Product
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Tips for Better Listings
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Use high-quality, well-lit photos showing the product from multiple angles</li>
            <li>• Write detailed descriptions including dimensions, materials, and intended use</li>
            <li>• Add relevant tags to improve search visibility</li>
            <li>• Competitive pricing increases conversion rates</li>
            <li>• Offer free shipping when possible to attract more buyers</li>
            <li>• Keep your inventory updated to avoid disappointing customers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;