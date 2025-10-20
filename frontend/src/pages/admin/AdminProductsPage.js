import React, { useState, useEffect } from 'react';
import ProductFormModal from './AdminAddProductFormModal'; 
import { 
  Search, Filter, Plus, Edit2, Trash2, Eye, Copy, MoreVertical,
  Package, DollarSign, TrendingUp, AlertCircle, Star, Image as ImageIcon,
  Tag, Layers, BarChart3, Download, Upload, RefreshCw, X, Check,
  Grid, List, ChevronDown, ChevronUp, ArrowUpDown, Heart, Share2,
  Clock, CheckCircle, XCircle, Zap, Percent, Gift
} from 'lucide-react';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const [expandedProduct, setExpandedProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    sku: '',
    price: 0,
    comparePrice: 0,
    costPrice: 0,
    categoryId: null,
    brand: '',
    stock: 0,
    lowStockThreshold: 10,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    images: [],
    tags: [],
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    allowBackorder: false,
    metaTitle: '',
    metaDescription: '',
    specifications: []
  });

  // Mock categories
  const categories = [
    { id: 1, name: 'Bicycles' },
    { id: 2, name: 'Mountain Bikes' },
    { id: 3, name: 'Road Bikes' },
    { id: 4, name: 'Kids Bikes' },
    { id: 5, name: 'Accessories' },
    { id: 6, name: 'Helmets' },
    { id: 7, name: 'Lights' },
    { id: 8, name: 'Spare Parts' },
    { id: 9, name: 'Tires & Tubes' },
    { id: 10, name: 'Brakes' }
  ];

  // Mock products data
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: 'Mountain Bike Pro X5',
        slug: 'mountain-bike-pro-x5',
        description: 'Professional mountain bike with advanced suspension system and durable frame.',
        shortDescription: 'Professional mountain bike',
        sku: 'MTB-PRO-X5-001',
        price: 125000,
        comparePrice: 150000,
        costPrice: 90000,
        categoryId: 2,
        categoryName: 'Mountain Bikes',
        brand: 'ProRide',
        stock: 12,
        lowStockThreshold: 5,
        sales: 145,
        views: 2345,
        rating: 4.8,
        reviews: 67,
        weight: 13.5,
        dimensions: { length: 180, width: 65, height: 110 },
        images: [
          'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
          'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400'
        ],
        tags: ['mountain', 'professional', 'suspension'],
        isActive: true,
        isFeatured: true,
        isNewArrival: false,
        allowBackorder: false,
        createdAt: '2024-09-15',
        updatedAt: '2025-10-05',
        status: 'active'
      },
      {
        id: 2,
        name: 'Road Racer Elite',
        slug: 'road-racer-elite',
        description: 'High-performance road bike designed for speed and endurance racing.',
        shortDescription: 'Speed racing road bike',
        sku: 'RDB-ELT-001',
        price: 145000,
        comparePrice: 180000,
        costPrice: 105000,
        categoryId: 3,
        categoryName: 'Road Bikes',
        brand: 'SpeedMax',
        stock: 8,
        lowStockThreshold: 5,
        sales: 132,
        views: 1987,
        rating: 4.9,
        reviews: 54,
        weight: 8.2,
        dimensions: { length: 175, width: 55, height: 105 },
        images: [
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400'
        ],
        tags: ['road', 'racing', 'lightweight'],
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        allowBackorder: false,
        createdAt: '2024-10-01',
        updatedAt: '2025-10-08',
        status: 'active'
      },
      {
        id: 3,
        name: 'Kids Explorer Bike',
        slug: 'kids-explorer-bike',
        description: 'Safe and fun bicycle designed specifically for children aged 5-10 years.',
        shortDescription: 'Children\'s bicycle',
        sku: 'KID-EXP-001',
        price: 18000,
        comparePrice: 22000,
        costPrice: 12000,
        categoryId: 4,
        categoryName: 'Kids Bikes',
        brand: 'JuniorRide',
        stock: 23,
        lowStockThreshold: 10,
        sales: 98,
        views: 1456,
        rating: 4.7,
        reviews: 43,
        weight: 9.5,
        dimensions: { length: 140, width: 50, height: 85 },
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
        ],
        tags: ['kids', 'safe', 'colorful'],
        isActive: true,
        isFeatured: false,
        isNewArrival: false,
        allowBackorder: true,
        createdAt: '2024-08-20',
        updatedAt: '2025-09-25',
        status: 'active'
      },
      {
        id: 4,
        name: 'Safety Helmet Pro',
        slug: 'safety-helmet-pro',
        description: 'Professional-grade cycling helmet with advanced impact protection.',
        shortDescription: 'Professional cycling helmet',
        sku: 'HLM-PRO-001',
        price: 5000,
        comparePrice: 6500,
        costPrice: 3000,
        categoryId: 6,
        categoryName: 'Helmets',
        brand: 'SafeGuard',
        stock: 56,
        lowStockThreshold: 20,
        sales: 234,
        views: 3421,
        rating: 4.6,
        reviews: 89,
        weight: 0.3,
        dimensions: { length: 30, width: 25, height: 20 },
        images: [
          'https://images.unsplash.com/photo-1562955779-e6be6c4a7c4e?w=400'
        ],
        tags: ['helmet', 'safety', 'protection'],
        isActive: true,
        isFeatured: true,
        isNewArrival: false,
        allowBackorder: true,
        createdAt: '2024-07-10',
        updatedAt: '2025-09-28',
        status: 'active'
      },
      {
        id: 5,
        name: 'LED Bike Light Set',
        slug: 'led-bike-light-set',
        description: 'Ultra-bright LED light set with front and rear lights for safe night riding.',
        shortDescription: 'Front and rear bike lights',
        sku: 'LGT-LED-001',
        price: 1500,
        comparePrice: 2000,
        costPrice: 800,
        categoryId: 7,
        categoryName: 'Lights',
        brand: 'BrightPath',
        stock: 89,
        lowStockThreshold: 30,
        sales: 187,
        views: 2876,
        rating: 4.5,
        reviews: 112,
        weight: 0.15,
        dimensions: { length: 10, width: 5, height: 5 },
        images: [
          'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=400'
        ],
        tags: ['lights', 'led', 'safety', 'night'],
        isActive: true,
        isFeatured: false,
        isNewArrival: true,
        allowBackorder: true,
        createdAt: '2024-09-05',
        updatedAt: '2025-10-02',
        status: 'active'
      },
      {
        id: 6,
        name: 'Mountain Bike Tires',
        slug: 'mountain-bike-tires',
        description: 'Durable all-terrain mountain bike tires with excellent grip.',
        shortDescription: 'All-terrain MTB tires',
        sku: 'TIR-MTB-001',
        price: 4500,
        comparePrice: 5500,
        costPrice: 2800,
        categoryId: 9,
        categoryName: 'Tires & Tubes',
        brand: 'TrailGrip',
        stock: 5,
        lowStockThreshold: 15,
        sales: 145,
        views: 1987,
        rating: 4.4,
        reviews: 78,
        weight: 0.85,
        dimensions: { length: 68, width: 68, height: 7 },
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
        ],
        tags: ['tires', 'mountain', 'grip'],
        isActive: true,
        isFeatured: false,
        isNewArrival: false,
        allowBackorder: false,
        createdAt: '2024-06-15',
        updatedAt: '2025-09-30',
        status: 'low_stock'
      },
      {
        id: 7,
        name: 'Bike Repair Kit',
        slug: 'bike-repair-kit',
        description: 'Complete bike repair kit with essential tools for on-the-go maintenance.',
        shortDescription: 'Essential repair tools',
        sku: 'KIT-REP-001',
        price: 5000,
        comparePrice: 6000,
        costPrice: 3200,
        categoryId: 8,
        categoryName: 'Spare Parts',
        brand: 'FixIt',
        stock: 34,
        lowStockThreshold: 10,
        sales: 76,
        views: 1234,
        rating: 4.3,
        reviews: 45,
        weight: 0.6,
        dimensions: { length: 20, width: 15, height: 8 },
        images: [
          'https://images.unsplash.com/photo-1581256106164-7b1b3a5f97e8?w=400'
        ],
        tags: ['tools', 'repair', 'maintenance'],
        isActive: true,
        isFeatured: false,
        isNewArrival: false,
        allowBackorder: true,
        createdAt: '2024-05-20',
        updatedAt: '2025-09-15',
        status: 'active'
      },
      {
        id: 8,
        name: 'Hydraulic Disc Brakes',
        slug: 'hydraulic-disc-brakes',
        description: 'High-performance hydraulic disc brake system for superior stopping power.',
        shortDescription: 'Premium disc brakes',
        sku: 'BRK-HYD-001',
        price: 12000,
        comparePrice: 15000,
        costPrice: 8000,
        categoryId: 10,
        categoryName: 'Brakes',
        brand: 'StopMax',
        stock: 18,
        lowStockThreshold: 8,
        sales: 87,
        views: 1654,
        rating: 4.7,
        reviews: 56,
        weight: 0.45,
        dimensions: { length: 15, width: 10, height: 8 },
        images: [
          'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400'
        ],
        tags: ['brakes', 'hydraulic', 'safety'],
        isActive: true,
        isFeatured: false,
        isNewArrival: false,
        allowBackorder: false,
        createdAt: '2024-07-01',
        updatedAt: '2025-10-01',
        status: 'active'
      },
      {
        id: 9,
        name: 'Cycling Jersey Pro',
        slug: 'cycling-jersey-pro',
        description: 'Professional cycling jersey with moisture-wicking fabric and aerodynamic fit.',
        shortDescription: 'Pro cycling apparel',
        sku: 'CLT-JER-001',
        price: 3500,
        comparePrice: 4500,
        costPrice: 2000,
        categoryId: 5,
        categoryName: 'Accessories',
        brand: 'RideStyle',
        stock: 0,
        lowStockThreshold: 15,
        sales: 23,
        views: 876,
        rating: 4.2,
        reviews: 12,
        weight: 0.18,
        dimensions: { length: 35, width: 30, height: 2 },
        images: [
          'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400'
        ],
        tags: ['clothing', 'jersey', 'apparel'],
        isActive: false,
        isFeatured: false,
        isNewArrival: false,
        allowBackorder: true,
        createdAt: '2024-08-10',
        updatedAt: '2025-09-20',
        status: 'out_of_stock'
      },
      {
        id: 10,
        name: 'Electric Bike City Cruiser',
        slug: 'electric-bike-city-cruiser',
        description: 'Premium electric bike with powerful motor and long-range battery.',
        shortDescription: 'Premium e-bike',
        sku: 'EBK-CRU-001',
        price: 185000,
        comparePrice: 220000,
        costPrice: 135000,
        categoryId: 1,
        categoryName: 'Bicycles',
        brand: 'E-Motion',
        stock: 6,
        lowStockThreshold: 3,
        sales: 34,
        views: 3456,
        rating: 4.9,
        reviews: 28,
        weight: 22.5,
        dimensions: { length: 180, width: 70, height: 115 },
        images: [
          'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400'
        ],
        tags: ['electric', 'e-bike', 'motor', 'battery'],
        isActive: true,
        isFeatured: true,
        isNewArrival: true,
        allowBackorder: false,
        createdAt: '2024-09-25',
        updatedAt: '2025-10-09',
        status: 'active'
      }
    ];

    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  // Filter and search
  useEffect(() => {
    let result = [...products];

    // Search
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.categoryId === parseInt(categoryFilter));
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(product => product.status === statusFilter);
    }

    // Stock filter
    if (stockFilter === 'in_stock') {
      result = result.filter(product => product.stock > 0);
    } else if (stockFilter === 'low_stock') {
      result = result.filter(product => product.stock > 0 && product.stock <= product.lowStockThreshold);
    } else if (stockFilter === 'out_of_stock') {
      result = result.filter(product => product.stock === 0);
    }

    // Price range filter
    if (priceRange !== 'all') {
      const ranges = {
        'under_5k': [0, 5000],
        '5k_20k': [5000, 20000],
        '20k_50k': [20000, 50000],
        '50k_100k': [50000, 100000],
        'over_100k': [100000, Infinity]
      };
      const [min, max] = ranges[priceRange];
      result = result.filter(product => product.price >= min && product.price < max);
    }

    // Sort
    result.sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === 'price') {
        aValue = a.price;
        bValue = b.price;
      } else if (sortField === 'stock') {
        aValue = a.stock;
        bValue = b.stock;
      } else if (sortField === 'sales') {
        aValue = a.sales;
        bValue = b.sales;
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, stockFilter, priceRange, sortField, sortDirection, products]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString()}`;
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
      low_stock: { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' },
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    return badges[status] || badges.active;
  };

  // Toggle product selection
  const toggleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Select all products
  const selectAllProducts = () => {
    if (selectedProducts.size === currentProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(currentProducts.map(p => p.id)));
    }
  };

  // Delete product
  const deleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      showNotification('Product deleted successfully');
    }
  };

  // Duplicate product
  const duplicateProduct = (product) => {
    const newProduct = {
      ...product,
      id: Math.max(...products.map(p => p.id)) + 1,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy`,
      sku: `${product.sku}-COPY`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts([...products, newProduct]);
    showNotification('Product duplicated successfully');
  };

  // Toggle product status
  const toggleProductStatus = (productId) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    );
    setProducts(updatedProducts);
    showNotification('Product status updated');
  };

  // Bulk delete
  const bulkDelete = () => {
    if (selectedProducts.size === 0) return;
    
    if (window.confirm(`Delete ${selectedProducts.size} selected products?`)) {
      setProducts(products.filter(p => !selectedProducts.has(p.id)));
      setSelectedProducts(new Set());
      showNotification(`${selectedProducts.size} products deleted`);
    }
  };

  // Bulk activate/deactivate
  const bulkToggleStatus = (activate) => {
    if (selectedProducts.size === 0) return;
    
    const updatedProducts = products.map(p =>
      selectedProducts.has(p.id) ? { ...p, isActive: activate } : p
    );
    setProducts(updatedProducts);
    setSelectedProducts(new Set());
    showNotification(`${selectedProducts.size} products ${activate ? 'activated' : 'deactivated'}`);
  };

  // Export products
  const exportProducts = () => {
    const dataStr = JSON.stringify(filteredProducts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Products exported successfully');
  };

  // Calculate product stats
  const productStats = {
    total: products.length,
    active: products.filter(p => p.isActive && p.stock > 0).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    featured: products.filter(p => p.isFeatured).length,
    newArrivals: products.filter(p => p.isNewArrival).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    totalSales: products.reduce((sum, p) => sum + p.sales, 0)
  };

  // Calculate profit margin
  const calculateMargin = (price, cost) => {
    if (cost === 0) return 0;
    return (((price - cost) / price) * 100).toFixed(1);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
        <p className="text-gray-600">Manage your product catalog and inventory</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
          <p className="text-xs text-gray-600 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{productStats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
          <p className="text-xs text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{productStats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
          <p className="text-xs text-gray-600 mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600">{productStats.lowStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-400">
          <p className="text-xs text-gray-600 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{productStats.outOfStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-400">
          <p className="text-xs text-gray-600 mb-1">Featured</p>
          <p className="text-2xl font-bold text-purple-600">{productStats.featured}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-400">
          <p className="text-xs text-gray-600 mb-1">New Arrivals</p>
          <p className="text-2xl font-bold text-indigo-600">{productStats.newArrivals}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-400 col-span-2">
          <p className="text-xs text-gray-600 mb-1">Inventory Value</p>
          <p className="text-xl font-bold text-orange-600">{formatCurrency(productStats.totalValue)}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, SKU, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Prices</option>
            <option value="under_5k">Under KES 5,000</option>
            <option value="5k_20k">KES 5,000 - 20,000</option>
            <option value="20k_50k">KES 20,000 - 50,000</option>
            <option value="50k_100k">KES 50,000 - 100,000</option>
            <option value="over_100k">Over KES 100,000</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
            <option value="sales">Sort by Sales</option>
          </select>

          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowUpDown size={18} />
            {sortDirection === 'asc' ? 'Asc' : 'Desc'}
          </button>

          <button
            onClick={exportProducts}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => {
              setModalMode('create');
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.size > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedProducts.size} product(s) selected
            </span>
            <button
              onClick={() => bulkToggleStatus(true)}
              className="text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Activate
            </button>
            <button
              onClick={() => bulkToggleStatus(false)}
              className="text-sm px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Deactivate
            </button>
            <button
              onClick={bulkDelete}
              className="text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => {
              const statusBadge = getStatusBadge(product.status);
              const discount = product.comparePrice > product.price 
                ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                : 0;

              return (
                <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="absolute top-3 left-3 w-5 h-5 z-10 cursor-pointer"
                    />
                    
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={48} className="text-gray-400" />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {product.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                          FEATURED
                        </span>
                      )}
                      {product.isNewArrival && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                          NEW
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setModalMode('view');
                          setShowModal(true);
                        }}
                        className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setModalMode('edit');
                          setFormData(product);
                          setShowModal(true);
                        }}
                        className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-500">{product.sku}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-2">{product.categoryName}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                      {product.comparePrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(product.comparePrice)}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <Package size={14} className="mx-auto mb-1 text-gray-600" />
                        <p className="font-semibold">{product.stock}</p>
                        <p className="text-gray-500">Stock</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <TrendingUp size={14} className="mx-auto mb-1 text-gray-600" />
                        <p className="font-semibold">{product.sales}</p>
                        <p className="text-gray-500">Sales</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <Star size={14} className="mx-auto mb-1 text-yellow-500 fill-yellow-500" />
                        <p className="font-semibold">{product.rating}</p>
                        <p className="text-gray-500">Rating</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateProduct(product)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-1"
                      >
                        <Copy size={14} />
                        Duplicate
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === currentProducts.length && currentProducts.length > 0}
                      onChange={selectAllProducts}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('name')}>
                    Product <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('price')}>
                    Price <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('stock')}>
                    Stock <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => handleSort('sales')}>
                    Sales <ArrowUpDown size={12} className="inline" />
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => {
                    const statusBadge = getStatusBadge(product.status);
                    const margin = calculateMargin(product.price, product.costPrice);

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleSelectProduct(product.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={24} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.sku}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {product.isFeatured && <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Featured</span>}
                              {product.isNewArrival && <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">New</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{product.categoryName}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                          {product.comparePrice > product.price && (
                            <p className="text-xs text-gray-500 line-through">{formatCurrency(product.comparePrice)}</p>
                          )}
                          <p className="text-xs text-green-600">{margin}% margin</p>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.stock === 0 ? 'bg-red-100 text-red-800' :
                            product.stock <= product.lowStockThreshold ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-medium text-gray-900">{product.sales}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setModalMode('view');
                                setShowModal(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setModalMode('edit');
                                setFormData(product);
                                setShowModal(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => duplicateProduct(product)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                              title="Duplicate"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center">
                      <Package size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No products found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-3 py-1">...</span>}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Product Modal */}
<ProductFormModal 
  isOpen={showModal}
  onClose={() => {
    setShowModal(false);
    setSelectedProduct(null);
    setModalMode('create');
  }}
  mode={modalMode === 'view' ? 'view' : modalMode}
  product={selectedProduct}
  onSuccess={(newProduct) => {
    // Refresh products list
    if (modalMode === 'create') {
      setProducts([newProduct, ...products]);
      showNotification('Product created successfully!');
    } else {
      setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
      showNotification('Product updated successfully!');
    }
  }}
/>
    </div>
  );
};

export default AdminProductsPage;