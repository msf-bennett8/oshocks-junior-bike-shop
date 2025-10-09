import { useState, useEffect } from 'react';
import {
  Search, Filter, Download, Upload, Edit, Trash2, Eye, MoreVertical,
  Plus, ChevronDown, X, AlertCircle, Check, Package, TrendingUp,
  TrendingDown, Clock, DollarSign, Image as ImageIcon, Copy, Archive,
  Star, BarChart3, RefreshCw, ChevronLeft, ChevronRight, Grid, List,
  ShoppingCart, Heart, MessageSquare, Settings, Zap, AlertTriangle
} from 'lucide-react';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    stockStatus: '',
    priceRange: '',
    featured: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    totalValue: 0,
    avgPrice: 0
  });

  // Mock products data
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: 'Mountain Bike Pro X500',
        sku: 'MTB-X500-001',
        category: 'Bicycles',
        subCategory: 'Mountain Bikes',
        price: 45000,
        costPrice: 30000,
        discountPrice: null,
        stock: 15,
        lowStockThreshold: 5,
        sold: 45,
        views: 1234,
        rating: 4.5,
        reviews: 28,
        status: 'active',
        featured: true,
        image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100',
        createdAt: '2025-09-15',
        updatedAt: '2025-10-08'
      },
      {
        id: 2,
        name: 'Road Racing Bike Elite',
        sku: 'RRB-ELITE-002',
        category: 'Bicycles',
        subCategory: 'Road Bikes',
        price: 65000,
        costPrice: 45000,
        discountPrice: null,
        stock: 8,
        lowStockThreshold: 5,
        sold: 32,
        views: 987,
        rating: 4.8,
        reviews: 19,
        status: 'active',
        featured: true,
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100',
        createdAt: '2025-09-20',
        updatedAt: '2025-10-07'
      },
      {
        id: 3,
        name: 'Kids Bicycle 16" Rainbow',
        sku: 'KIDS-16-003',
        category: 'Bicycles',
        subCategory: 'Kids Bikes',
        price: 12500,
        costPrice: 8000,
        discountPrice: 10500,
        stock: 25,
        lowStockThreshold: 10,
        sold: 78,
        views: 2341,
        rating: 4.6,
        reviews: 45,
        status: 'active',
        featured: false,
        image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=100',
        createdAt: '2025-08-10',
        updatedAt: '2025-10-09'
      },
      {
        id: 4,
        name: 'Professional Bike Helmet',
        sku: 'HELM-PRO-004',
        category: 'Accessories',
        subCategory: 'Helmets',
        price: 3500,
        costPrice: 2000,
        discountPrice: null,
        stock: 50,
        lowStockThreshold: 15,
        sold: 156,
        views: 3456,
        rating: 4.7,
        reviews: 89,
        status: 'active',
        featured: false,
        image: 'https://images.unsplash.com/photo-1562438120-3f78a7d69a50?w=100',
        createdAt: '2025-07-15',
        updatedAt: '2025-10-05'
      },
      {
        id: 5,
        name: 'Hydraulic Disc Brakes Set',
        sku: 'BRAKE-HYD-005',
        category: 'Parts',
        subCategory: 'Brakes',
        price: 8500,
        costPrice: 5500,
        discountPrice: 7500,
        stock: 0,
        lowStockThreshold: 5,
        sold: 67,
        views: 1567,
        rating: 4.9,
        reviews: 34,
        status: 'active',
        featured: true,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
        createdAt: '2025-08-25',
        updatedAt: '2025-10-02'
      },
      {
        id: 6,
        name: 'LED Bike Light Set',
        sku: 'LIGHT-LED-006',
        category: 'Accessories',
        subCategory: 'Lights',
        price: 2500,
        costPrice: 1500,
        discountPrice: null,
        stock: 3,
        lowStockThreshold: 10,
        sold: 234,
        views: 4567,
        rating: 4.4,
        reviews: 123,
        status: 'active',
        featured: false,
        image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=100',
        createdAt: '2025-06-20',
        updatedAt: '2025-10-08'
      },
      {
        id: 7,
        name: 'Electric Mountain Bike E-Pro',
        sku: 'EBIKE-EPR-007',
        category: 'Bicycles',
        subCategory: 'Electric Bikes',
        price: 125000,
        costPrice: 85000,
        discountPrice: null,
        stock: 5,
        lowStockThreshold: 3,
        sold: 12,
        views: 876,
        rating: 4.9,
        reviews: 8,
        status: 'active',
        featured: true,
        image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=100',
        createdAt: '2025-09-01',
        updatedAt: '2025-10-09'
      },
      {
        id: 8,
        name: 'Bike Repair Tool Kit',
        sku: 'TOOL-KIT-008',
        category: 'Accessories',
        subCategory: 'Tools',
        price: 4200,
        costPrice: 2500,
        discountPrice: 3500,
        stock: 18,
        lowStockThreshold: 8,
        sold: 89,
        views: 1890,
        rating: 4.6,
        reviews: 56,
        status: 'inactive',
        featured: false,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100',
        createdAt: '2025-07-30',
        updatedAt: '2025-09-15'
      }
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      calculateStats(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate statistics
  const calculateStats = (productList) => {
    const active = productList.filter(p => p.status === 'active').length;
    const outOfStock = productList.filter(p => p.stock === 0).length;
    const lowStock = productList.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const totalValue = productList.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const avgPrice = productList.reduce((sum, p) => sum + p.price, 0) / productList.length;

    setStats({
      totalProducts: productList.length,
      activeProducts: active,
      outOfStock,
      lowStock,
      totalValue,
      avgPrice
    });
  };

  // Filter and search
  useEffect(() => {
    let result = [...products];

    // Search
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }

    // Status filter
    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }

    // Stock status filter
    if (filters.stockStatus === 'out') {
      result = result.filter(p => p.stock === 0);
    } else if (filters.stockStatus === 'low') {
      result = result.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
    } else if (filters.stockStatus === 'in') {
      result = result.filter(p => p.stock > p.lowStockThreshold);
    }

    // Featured filter
    if (filters.featured === 'yes') {
      result = result.filter(p => p.featured);
    } else if (filters.featured === 'no') {
      result = result.filter(p => !p.featured);
    }

    // Sorting
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'stock-asc':
        result.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock-desc':
        result.sort((a, b) => b.stock - a.stock);
        break;
      case 'date-desc':
        result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy, products]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(p => p.id));
    }
  };

  const toggleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Action handlers
  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleDuplicate = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleStatusChange = (productId, newStatus) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, status: newStatus } : p
    ));
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'delete':
        setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        break;
      case 'activate':
        setProducts(prev => prev.map(p =>
          selectedProducts.includes(p.id) ? { ...p, status: 'active' } : p
        ));
        setSelectedProducts([]);
        break;
      case 'deactivate':
        setProducts(prev => prev.map(p =>
          selectedProducts.includes(p.id) ? { ...p, status: 'inactive' } : p
        ));
        setSelectedProducts([]);
        break;
      case 'feature':
        setProducts(prev => prev.map(p =>
          selectedProducts.includes(p.id) ? { ...p, featured: true } : p
        ));
        setSelectedProducts([]);
        break;
      default:
        break;
    }
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) return { label: 'Out of Stock', color: 'red' };
    if (product.stock <= product.lowStockThreshold) return { label: 'Low Stock', color: 'yellow' };
    return { label: 'In Stock', color: 'green' };
  };

  const exportProducts = () => {
    // In real app, generate CSV/Excel
    console.log('Exporting products...', filteredProducts);
    alert('Product export started! File will download shortly.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
              <p className="text-gray-600 mt-1">Organize and manage your product inventory</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportProducts}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => window.location.href = '/seller/add-product'}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-600">Low Stock</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <X className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">Out of Stock</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Total Value</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {(stats.totalValue / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600">Avg Price</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {(stats.avgPrice / 1000).toFixed(1)}K
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, SKU, or category..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors ${
                showFilters ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {Object.values(filters).filter(v => v).length > 0 && (
                <span className="bg-white text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {Object.values(filters).filter(v => v).length}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="date-desc">Latest Updated</option>
              <option value="date-asc">Oldest Updated</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="stock-asc">Stock (Low to High)</option>
              <option value="stock-desc">Stock (High to Low)</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 border-l ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Categories</option>
                <option value="Bicycles">Bicycles</option>
                <option value="Accessories">Accessories</option>
                <option value="Parts">Parts</option>
                <option value="Clothing">Clothing</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={filters.stockStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Stock Levels</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <select
                value={filters.featured}
                onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Products</option>
                <option value="yes">Featured Only</option>
                <option value="no">Non-Featured</option>
              </select>

              <button
                onClick={() => setFilters({ category: '', status: '', stockStatus: '', priceRange: '', featured: '' })}
                className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg font-medium"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium text-blue-900">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('feature')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                >
                  Feature
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedProducts([])}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Products List/Grid */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sales</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentProducts.map(product => {
                  const stockStatus = getStockStatus(product);
                  const profit = product.price - product.costPrice;
                  const profitMargin = ((profit / product.costPrice) * 100).toFixed(0);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {product.featured && (
                                <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                  <Star className="w-3 h-3 fill-current" />
                                  Featured
                                </span>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Eye className="w-3 h-3" />
                                {product.views}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 font-mono">{product.sku}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.category}</p>
                          <p className="text-xs text-gray-500">{product.subCategory}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            KSh {product.price.toLocaleString()}
                          </p>
                          {product.discountPrice && (
                            <p className="text-xs text-gray-500 line-through">
                              KSh {product.discountPrice.toLocaleString()}
                            </p>
                          )}
                          <p className="text-xs text-green-600 mt-0.5">
                            +{profitMargin}% margin
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            stockStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                            stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {product.stock}
                          </span>
                          {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{product.sold}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={product.status}
                          onChange={(e) => handleStatusChange(product.id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded border-0 focus:ring-2 focus:ring-orange-500 ${
                            product.status === 'active' ? 'bg-green-100 text-green-700' :
                            product.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                            'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="draft">Draft</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(product)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map(product => {
              const stockStatus = getStockStatus(product);
              return (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 bg-white"
                      />
                      {product.featured && (
                        <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        stockStatus.color === 'green' ? 'bg-green-600 text-white' :
                        stockStatus.color === 'yellow' ? 'bg-yellow-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {stockStatus.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{product.category} • {product.subCategory}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        KSh {product.price.toLocaleString()}
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          KSh {product.discountPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Stock</p>
                        <p className="font-semibold text-gray-900">{product.stock}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Sold</p>
                        <p className="font-semibold text-gray-900">{product.sold}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-600">Views</p>
                        <p className="font-semibold text-gray-900">{product.views}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusChange(product.id, e.target.value)}
                        className={`flex-1 text-xs font-medium px-2 py-1.5 rounded border-0 focus:ring-2 focus:ring-orange-500 ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(product)}
                        className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 border-2 border-red-300 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-orange-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{productToDelete?.name}</strong>? 
                This will permanently remove the product and all associated data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Edit Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Quick Edit Product</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSh)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingProduct.status}
                      onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 h-full">
                      <input
                        type="checkbox"
                        checked={editingProduct.featured}
                        onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured Product</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;