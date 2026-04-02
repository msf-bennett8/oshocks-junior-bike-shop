import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Filter, Download, Upload, Edit2, Trash2, Eye, EyeOff, 
  Copy, MoreVertical, Package, TrendingUp, AlertTriangle, CheckCircle, 
  XCircle, ChevronDown, ChevronUp, Grid, List, Calendar, DollarSign, 
  BarChart3, Image as ImageIcon, X, Save, PlusCircle, MinusCircle
} from 'lucide-react';
import sellerDashboardService from '../../services/sellerDashboardService';
import { useAuth } from '../../context/AuthContext';

const SellerProductPage = () => {
  console.log('[DEBUG] SellerProductPage component rendering');
  
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  console.log('[PAGE] Auth state:', { 
    isAuthenticated, 
    userId: user?.id, 
    userRole: user?.role,
    userName: user?.name 
  });
  
  console.log('[DEBUG] Auth state:', { isAuthenticated, user });
  
  // Data states
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  
  // Selection
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [moreOptionsModalOpen, setMoreOptionsModalOpen] = useState(false);
  const [selectedProductForAction, setSelectedProductForAction] = useState(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [stockAdjustModalOpen, setStockAdjustModalOpen] = useState(false);
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category_id: '',
    condition: 'new',
    brand: '',
    year: '',
    specifications: { key_features: [], sizes: [] }
  });
  const [editImages, setEditImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [saving, setSaving] = useState(false);

  // Fetch products from database
    // Fetch products from database
    // Fetch products from database
  const fetchProducts = useCallback(async () => {
    console.log('[PAGE] fetchProducts CALLED');
    console.log('[PAGE] isAuthenticated:', isAuthenticated);
    console.log('[PAGE] user:', user);
    
    if (!isAuthenticated) {
      console.log('[PAGE] NOT AUTHENTICATED - returning early');
      return;
    }
    console.log('[PAGE] AUTHENTICATED - proceeding with API call');
    
    console.log('[DEBUG] fetchProducts - AUTHENTICATED, proceeding with API call');
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy === 'newest' ? 'created_at' : sortBy,
        direction: sortBy === 'newest' ? 'desc' : 'asc'
      };
      
      console.log('[DEBUG] Fetching with params:', params);
      
      const response = await sellerDashboardService.getProducts(params);
      
      console.log('[DEBUG] Raw API response:', response);
      console.log('[DEBUG] Response.success:', response?.success);
      console.log('[DEBUG] Response.data:', response?.data);
      console.log('[DEBUG] Response.data is array?', Array.isArray(response?.data));
      console.log('[DEBUG] Response.data length:', response?.data?.length);
      
      // Handle both wrapped {success: true, data: []} and direct array responses
      const productsData = response.success ? response.data : (Array.isArray(response) ? response : response.data);
      const paginationData = response.success ? response.pagination : response.meta;
      
      console.log('[DEBUG] productsData:', productsData);
      console.log('[DEBUG] paginationData:', paginationData);
      
      if (productsData && productsData.length >= 0) {
        const mappedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category?.name || 'Uncategorized',
          category_id: product.category_id,
          price: parseFloat(product.price),
          stock: parseInt(product.quantity),
          status: product.is_active ? (parseInt(product.quantity) === 0 ? 'out_of_stock' : 'active') : 'hidden',
          is_active: product.is_active,
          image: product.images?.[0]?.thumbnail_url || product.images?.[0]?.image_url || null,
          images: product.images || [],
          views: parseInt(product.views_count || product.view_count || 0),
          sales: parseInt(product.sales || product.sales_count || 0),
          rating: parseFloat(product.rating || 0),
          reviews: parseInt(product.reviews_count || 0),
          condition: product.condition,
          brand: product.brand,
          year: product.year,
          description: product.description,
          variants: product.variants || [],
          specifications: product.specifications || {},
          dateAdded: product.created_at,
          lastUpdated: product.updated_at
        }));
        
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
        setTotalPages(paginationData?.last_page || 1);
      } else {
        console.error('[DEBUG] No products data found in response');
        setError('Failed to fetch products: No data returned');
      }
    } catch (err) {
      console.error('[DEBUG] Error in fetchProducts:', err);
      console.error('[DEBUG] Error message:', err.message);
      console.error('[DEBUG] Error response:', err.response);
      console.error('[DEBUG] Error status:', err.response?.status);
      console.error('[DEBUG] Error data:', err.response?.data);
      setError(err.message || 'Failed to load products');
    } finally {
      console.log('[DEBUG] fetchProducts completed, loading set to false');
      setLoading(false);
    }
  }, [isAuthenticated, currentPage, searchQuery, selectedCategory, sortBy]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await sellerDashboardService.getCategories?.() || { data: [] };
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    console.log('[DEBUG] useEffect triggered - calling fetchProducts and fetchCategories');
    console.log('[DEBUG] Dependencies:', { isAuthenticated, currentPage, searchQuery, selectedCategory, sortBy });
    
    if (isAuthenticated) {
      fetchProducts();
      fetchCategories();
    } else {
      console.log('[DEBUG] Not authenticated, skipping fetch');
    }
  }, [fetchProducts, fetchCategories, isAuthenticated]);

  // Filter products locally
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === parseInt(selectedCategory));
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => {
        if (selectedStatus === 'active') return p.is_active && p.stock > 0;
        if (selectedStatus === 'out_of_stock') return p.stock === 0;
        if (selectedStatus === 'hidden') return !p.is_active;
        return true;
      });
    }

    // Stock filter
    if (stockFilter !== 'all') {
      if (stockFilter === 'in_stock') {
        filtered = filtered.filter(p => p.stock > 0);
      } else if (stockFilter === 'low_stock') {
        filtered = filtered.filter(p => p.stock > 0 && p.stock <= 5);
      } else if (stockFilter === 'out_of_stock') {
        filtered = filtered.filter(p => p.stock === 0);
      }
    }

    // Price range
    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max));
    }

    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'newest': return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'oldest': return new Date(a.dateAdded) - new Date(b.dateAdded);
        case 'price_high': return b.price - a.price;
        case 'price_low': return a.price - b.price;
        case 'name_az': return a.name.localeCompare(b.name);
        case 'name_za': return b.name.localeCompare(a.name);
        case 'most_viewed': return b.views - a.views;
        case 'best_selling': return b.sales - a.sales;
        default: return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedStatus, stockFilter, priceRange, sortBy, products]);

  // Stats calculation
  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    hidden: products.filter(p => !p.is_active).length,
    totalViews: products.reduce((sum, p) => sum + p.views, 0),
    totalSales: products.reduce((sum, p) => sum + p.sales, 0)
  };

  // Handlers
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status, isActive) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
    if (stock <= 5) return { label: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Edit modal handlers
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      quantity: product.stock,
      category_id: product.category_id,
      condition: product.condition || 'new',
      brand: product.brand || '',
      year: product.year || '',
      specifications: product.specifications || { key_features: [], sizes: [] }
    });
    setEditImages(product.images || []);
    setNewImages([]);
    setImagesToDelete([]);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingProduct(null);
    setNewImages([]);
    setImagesToDelete([]);
  };

  const handleImageDelete = (imageId) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setEditImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleNewImageAdd = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Append basic fields
      Object.keys(editFormData).forEach(key => {
        if (key === 'specifications') {
          formData.append(key, JSON.stringify(editFormData[key]));
        } else {
          formData.append(key, editFormData[key]);
        }
      });
      
      // Append method override for PUT
      formData.append('_method', 'PUT');
      
      // Append images to delete
      if (imagesToDelete.length > 0) {
        formData.append('images_to_delete', JSON.stringify(imagesToDelete));
      }
      
      // Append new images
      newImages.forEach((file, index) => {
        formData.append(`new_images[${index}]`, file);
      });
      
      await sellerDashboardService.updateProduct(editingProduct.id, formData);
      
      // Refresh products
      await fetchProducts();
      closeEditModal();
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // More options handlers
  const openMoreOptions = (product, e) => {
    e.stopPropagation();
    setSelectedProductForAction(product);
    setMoreOptionsModalOpen(true);
  };

  const handleToggleVisibility = async () => {
    if (!selectedProductForAction) return;
    
    try {
      await sellerDashboardService.toggleProductVisibility(
        selectedProductForAction.id, 
        !selectedProductForAction.is_active
      );
      await fetchProducts();
      setMoreOptionsModalOpen(false);
    } catch (err) {
      console.error('Error toggling visibility:', err);
      alert('Failed to update product visibility');
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProductForAction) return;
    
    try {
      await sellerDashboardService.deleteProduct(selectedProductForAction.id);
      await fetchProducts();
      setMoreOptionsModalOpen(false);
      setDeleteConfirmModalOpen(false);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const handleDuplicateProduct = async () => {
    if (!selectedProductForAction) return;
    
    try {
      await sellerDashboardService.duplicateProduct(selectedProductForAction.id);
      await fetchProducts();
      setMoreOptionsModalOpen(false);
    } catch (err) {
      console.error('Error duplicating product:', err);
      alert('Failed to duplicate product');
    }
  };

  const handleAdjustStock = async (adjustment) => {
    if (!selectedProductForAction) return;
    
    const newStock = selectedProductForAction.stock + adjustment;
    if (newStock < 0) {
      alert('Stock cannot be negative');
      return;
    }
    
    try {
      await sellerDashboardService.updateProductStock(selectedProductForAction.id, newStock);
      await fetchProducts();
      setStockAdjustModalOpen(false);
      setMoreOptionsModalOpen(false);
    } catch (err) {
      console.error('Error adjusting stock:', err);
      alert('Failed to adjust stock');
    }
  };

  const navigateToProductDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
          <p className="text-gray-600">Manage your product inventory and listings</p>
          
          {/* DEBUG BUTTON - Remove after fixing */}
          <button 
            onClick={() => {
              console.log('[DEBUG] Manual refresh clicked');
              fetchProducts();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Manual Refresh Products
          </button>
          <button 
            onClick={() => {
              console.log('[DEBUG] Testing API directly...');
              sellerDashboardService.getProducts({ page: 1 }).then(r => {
                console.log('[DEBUG] Direct API call success:', r);
              }).catch(e => {
                console.error('[DEBUG] Direct API call failed:', e);
              });
            }}
            className="mt-4 ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            🧪 Test API Directly
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hidden</p>
                <p className="text-2xl font-bold text-gray-600">{stats.hidden}</p>
              </div>
              <EyeOff className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalSales}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full lg:w-auto flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button 
                onClick={fetchProducts}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => navigate('/seller/products/add')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Stock</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="999999"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions & View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-4">
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedProducts.length} selected</span>
                <div className="relative">
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                  >
                    Bulk Actions
                  </button>
                  {showBulkActions && (
                    <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                      <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Activate
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm">
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm text-red-600">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <span className="text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_high">Price: High to Low</option>
                <option value="price_low">Price: Low to High</option>
                <option value="name_az">Name: A-Z</option>
                <option value="name_za">Name: Z-A</option>
                <option value="most_viewed">Most Viewed</option>
                <option value="best_selling">Best Selling</option>
              </select>
            </div>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.stock);
              const isHidden = !product.is_active;
              
              return (
                <div 
                  key={product.id} 
                  className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow relative ${isHidden ? 'opacity-60' : ''}`}
                >
                  {/* Hidden Badge */}
                  {isHidden && (
                    <div className="absolute top-3 left-3 z-10 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                      HIDDEN
                    </div>
                  )}
                  
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="absolute top-3 right-3 w-5 h-5 rounded border-gray-300 z-10"
                    />
                    
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className={`w-full h-full object-cover ${isHidden ? 'grayscale' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-16 h-16" />
                        </div>
                      )}
                      
                      {/* Stock Status Badge */}
                      <div className={`absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.label} ({product.stock})
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status, product.is_active)}`}>
                        {product.is_active ? (product.stock > 0 ? 'Active' : 'Out of Stock') : 'Hidden'}
                      </span>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Views</p>
                        <p className="font-semibold text-gray-900">{product.views}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Sales</p>
                        <p className="font-semibold text-gray-900">{product.sales}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Rating</p>
                        <p className="font-semibold text-gray-900">
                          {product.rating > 0 ? product.rating.toFixed(1) : '-'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {/* Edit Button - Orange-Red to Orange Gradient */}
                      <button 
                        onClick={() => openEditModal(product)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      
                      {/* View Button */}
                      <button 
                        onClick={() => navigateToProductDetail(product.id)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="View Product"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      {/* More Options */}
                      <button 
                        onClick={(e) => openMoreOptions(product, e)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Performance</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product.stock);
                  
                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 ${!product.is_active ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-5 h-5 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className={`w-full h-full object-cover ${!product.is_active ? 'grayscale' : ''}`} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 block">{product.name}</span>
                            {!product.is_active && (
                              <span className="text-xs text-gray-500">(Hidden)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status, product.is_active)}`}>
                          {product.is_active ? (product.stock > 0 ? 'Active' : 'Out of Stock') : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3 text-xs text-gray-600">
                          <span>{product.views} views</span>
                          <span>{product.sales} sales</span>
                          <span>⭐ {product.rating > 0 ? product.rating.toFixed(1) : '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigateToProductDetail(product.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={(e) => openMoreOptions(product, e)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Get started by adding your first product'}
            </p>
            <button 
              onClick={() => navigate('/seller/products/add')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg ${currentPage === pageNum ? 'bg-orange-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                <p className="text-sm text-gray-600">{editingProduct.name}</p>
              </div>
              <button onClick={closeEditModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editFormData.category_id}
                    onChange={(e) => setEditFormData({...editFormData, category_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES) *</label>
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({...editFormData, quantity: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={editFormData.condition}
                    onChange={(e) => setEditFormData({...editFormData, condition: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              {/* Images Management */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                
                {/* Current Images */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {editImages.map((image) => (
                    <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={image.thumbnail_url || image.image_url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(image.id)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {image.is_primary && (
                        <span className="absolute bottom-1 left-1 bg-orange-600 text-white text-xs px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* New Images Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageAdd}
                    className="hidden"
                    id="new-images"
                  />
                  <label htmlFor="new-images" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload new images</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
                  </label>
                </div>

                {/* New Images Preview */}
                {newImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                          New
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MORE OPTIONS MODAL */}
      {moreOptionsModalOpen && selectedProductForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Options</h3>
              <button onClick={() => setMoreOptionsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-2">
              {/* Hide/Unhide */}
              <button
                onClick={handleToggleVisibility}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                {selectedProductForAction.is_active ? (
                  <>
                    <EyeOff className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Hide Product</p>
                      <p className="text-sm text-gray-500">Remove from public view</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Unhide Product</p>
                      <p className="text-sm text-gray-500">Make visible to customers</p>
                    </div>
                  </>
                )}
              </button>

              {/* Adjust Stock */}
              <button
                onClick={() => setStockAdjustModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Package className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Adjust Stock</p>
                  <p className="text-sm text-gray-500">Current: {selectedProductForAction.stock} units</p>
                </div>
              </button>

              {/* Duplicate */}
              <button
                onClick={handleDuplicateProduct}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <Copy className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">Duplicate Product</p>
                  <p className="text-sm text-gray-500">Create a copy with new SKU</p>
                </div>
              </button>

              <hr className="my-2" />

              {/* Delete */}
              <button
                onClick={() => setDeleteConfirmModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-left text-red-600"
              >
                <Trash2 className="w-5 h-5" />
                <div>
                  <p className="font-medium">Delete Product</p>
                  <p className="text-sm text-red-400">This action cannot be undone</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Product?</h3>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete "{selectedProductForAction?.name}"? 
                This will also remove all associated images from Cloudinary.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {stockAdjustModalOpen && selectedProductForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Adjust Stock</h3>
              <button onClick={() => setStockAdjustModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-gray-900 mb-2">{selectedProductForAction.stock}</p>
              <p className="text-gray-600">Current Stock</p>
            </div>
            
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => handleAdjustStock(-1)}
                className="flex-1 py-3 border-2 border-red-200 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 text-red-600"
              >
                <MinusCircle className="w-5 h-5" />
                Decrease
              </button>
              <button
                onClick={() => handleAdjustStock(1)}
                className="flex-1 py-3 border-2 border-green-200 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2 text-green-600"
              >
                <PlusCircle className="w-5 h-5" />
                Increase
              </button>
            </div>
            
            <button
              onClick={() => setStockAdjustModalOpen(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductPage;