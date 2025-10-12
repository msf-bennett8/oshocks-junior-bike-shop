import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Download, Upload, Edit2, Trash2, Eye, EyeOff, Copy, MoreVertical, Package, TrendingUp, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Grid, List, Calendar, DollarSign, BarChart3 } from 'lucide-react';

const SellerProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [stockFilter, setStockFilter] = useState('all');
  
  const itemsPerPage = 12;

  // Mock product data
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: 'Mountain Bike Pro X1',
        sku: 'MTB-001',
        category: 'Mountain Bikes',
        price: 45000,
        stock: 12,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
        views: 324,
        sales: 8,
        rating: 4.5,
        reviews: 12,
        dateAdded: '2025-01-15',
        lastUpdated: '2025-10-10'
      },
      {
        id: 2,
        name: 'Road Bike Speed 200',
        sku: 'RDB-002',
        category: 'Road Bikes',
        price: 65000,
        stock: 5,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
        views: 156,
        sales: 3,
        rating: 4.8,
        reviews: 7,
        dateAdded: '2025-02-20',
        lastUpdated: '2025-10-11'
      },
      {
        id: 3,
        name: 'Hybrid City Cruiser',
        sku: 'HYB-003',
        category: 'Hybrid Bikes',
        price: 38000,
        stock: 0,
        status: 'out_of_stock',
        image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400',
        views: 89,
        sales: 15,
        rating: 4.2,
        reviews: 18,
        dateAdded: '2025-03-10',
        lastUpdated: '2025-10-09'
      },
      {
        id: 4,
        name: 'Electric Bike E-Power',
        sku: 'ELC-004',
        category: 'Electric Bikes',
        price: 120000,
        stock: 3,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1591768575450-a76b1c955738?w=400',
        views: 567,
        sales: 12,
        rating: 4.9,
        reviews: 25,
        dateAdded: '2025-04-05',
        lastUpdated: '2025-10-12'
      },
      {
        id: 5,
        name: 'Kids Bike Rainbow',
        sku: 'KID-005',
        category: 'Kids Bikes',
        price: 15000,
        stock: 20,
        status: 'active',
        image: 'https://images.unsplash.com/photo-1519583272095-6433daf26b6e?w=400',
        views: 234,
        sales: 22,
        rating: 4.6,
        reviews: 31,
        dateAdded: '2025-05-12',
        lastUpdated: '2025-10-10'
      },
      {
        id: 6,
        name: 'BMX Stunt Pro',
        sku: 'BMX-006',
        category: 'BMX Bikes',
        price: 28000,
        stock: 8,
        status: 'draft',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        views: 45,
        sales: 0,
        rating: 0,
        reviews: 0,
        dateAdded: '2025-10-01',
        lastUpdated: '2025-10-12'
      }
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    if (stockFilter !== 'all') {
      if (stockFilter === 'in_stock') {
        filtered = filtered.filter(p => p.stock > 0);
      } else if (stockFilter === 'low_stock') {
        filtered = filtered.filter(p => p.stock > 0 && p.stock <= 5);
      } else if (stockFilter === 'out_of_stock') {
        filtered = filtered.filter(p => p.stock === 0);
      }
    }

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
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, stockFilter, priceRange, sortBy, products]);

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const bulkActions = [
    { label: 'Activate', action: 'activate', icon: CheckCircle },
    { label: 'Deactivate', action: 'deactivate', icon: EyeOff },
    { label: 'Delete', action: 'delete', icon: Trash2 },
    { label: 'Export Selected', action: 'export', icon: Download },
    { label: 'Duplicate', action: 'duplicate', icon: Copy }
  ];

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    outOfStock: products.filter(p => p.stock === 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    totalViews: products.reduce((sum, p) => sum + p.views, 0),
    totalSales: products.reduce((sum, p) => sum + p.sales, 0)
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600' };
    if (stock <= 5) return { label: 'Low Stock', color: 'text-orange-600' };
    return { label: 'In Stock', color: 'text-green-600' };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
          <p className="text-gray-600">Manage your product inventory and listings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
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
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="999999"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                      {bulkActions.map((action) => (
                        <button
                          key={action.action}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left text-sm"
                        >
                          <action.icon className="w-4 h-4" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <span className="text-sm text-gray-600">
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
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
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="absolute top-3 left-3 w-5 h-5 rounded border-gray-300 z-10"
                  />
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-3 right-3 flex gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      KSh {product.price.toLocaleString()}
                    </span>
                    <span className={`text-sm font-medium ${getStockStatus(product.stock).color}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Views</p>
                      <p className="text-sm font-semibold text-gray-900">{product.views}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Sales</p>
                      <p className="text-sm font-semibold text-gray-900">{product.sales}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Rating</p>
                      <p className="text-sm font-semibold text-gray-900">{product.rating || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === paginatedProducts.length}
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
                {paginatedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
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
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover" />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      KSh {product.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${getStockStatus(product.stock).color}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 text-xs text-gray-600">
                        <span>{product.views} views</span>
                        <span>{product.sales} sales</span>
                        <span>⭐ {product.rating || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Duplicate">
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 border rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Go to page:</label>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && (
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" />
                Add Your First Product
              </button>
            )}
          </div>
        )}

        {/* Quick Actions Panel */}
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add New Product</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Bulk Upload CSV</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">View Analytics</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Low Stock Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductPage;