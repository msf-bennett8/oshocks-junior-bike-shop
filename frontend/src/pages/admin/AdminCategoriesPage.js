import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, ChevronRight, ChevronDown, Filter, Download, Upload, AlertCircle, Check, X } from 'lucide-react';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    image: '',
    isActive: true,
    displayOrder: 0,
    metaTitle: '',
    metaDescription: '',
    showInMenu: true,
    icon: ''
  });

  // Mock initial data - cycling-specific categories
  useEffect(() => {
    const mockCategories = [
      {
        id: 1,
        name: 'Bicycles',
        slug: 'bicycles',
        description: 'Complete bikes for all purposes',
        parentId: null,
        image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400',
        isActive: true,
        displayOrder: 1,
        productCount: 245,
        metaTitle: 'Shop Bicycles Online in Kenya',
        metaDescription: 'Wide range of bicycles for all ages and purposes',
        showInMenu: true,
        icon: '🚴',
        createdAt: '2024-01-15',
        updatedAt: '2024-10-05'
      },
      {
        id: 2,
        name: 'Mountain Bikes',
        slug: 'mountain-bikes',
        description: 'Off-road and trail bicycles',
        parentId: 1,
        image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
        isActive: true,
        displayOrder: 1,
        productCount: 89,
        metaTitle: 'Mountain Bikes Kenya',
        metaDescription: 'Best mountain bikes for Kenyan terrain',
        showInMenu: true,
        icon: '⛰️',
        createdAt: '2024-01-15',
        updatedAt: '2024-09-20'
      },
      {
        id: 3,
        name: 'Road Bikes',
        slug: 'road-bikes',
        description: 'Speed bikes for paved roads',
        parentId: 1,
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
        isActive: true,
        displayOrder: 2,
        productCount: 67,
        metaTitle: 'Road Bikes Kenya',
        metaDescription: 'High-performance road bikes',
        showInMenu: true,
        icon: '🏁',
        createdAt: '2024-01-16',
        updatedAt: '2024-10-01'
      },
      {
        id: 4,
        name: 'Kids Bikes',
        slug: 'kids-bikes',
        description: 'Bicycles for children',
        parentId: 1,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        isActive: true,
        displayOrder: 3,
        productCount: 56,
        metaTitle: 'Kids Bicycles Kenya',
        metaDescription: 'Safe and fun bikes for children',
        showInMenu: true,
        icon: '👶',
        createdAt: '2024-01-16',
        updatedAt: '2024-09-25'
      },
      {
        id: 5,
        name: 'Accessories',
        slug: 'accessories',
        description: 'Cycling accessories and gear',
        parentId: null,
        image: 'https://images.unsplash.com/photo-1575435123966-8811167ec52a?w=400',
        isActive: true,
        displayOrder: 2,
        productCount: 423,
        metaTitle: 'Cycling Accessories Kenya',
        metaDescription: 'All cycling accessories and gear',
        showInMenu: true,
        icon: '🎒',
        createdAt: '2024-01-17',
        updatedAt: '2024-10-03'
      },
      {
        id: 6,
        name: 'Helmets',
        slug: 'helmets',
        description: 'Safety helmets for all riders',
        parentId: 5,
        image: 'https://images.unsplash.com/photo-1562955779-e6be6c4a7c4e?w=400',
        isActive: true,
        displayOrder: 1,
        productCount: 78,
        metaTitle: 'Cycling Helmets Kenya',
        metaDescription: 'Quality safety helmets for cyclists',
        showInMenu: true,
        icon: '🪖',
        createdAt: '2024-01-17',
        updatedAt: '2024-09-28'
      },
      {
        id: 7,
        name: 'Lights',
        slug: 'lights',
        description: 'Front and rear bike lights',
        parentId: 5,
        image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=400',
        isActive: true,
        displayOrder: 2,
        productCount: 92,
        metaTitle: 'Bike Lights Kenya',
        metaDescription: 'Bike lights for safe night riding',
        showInMenu: true,
        icon: '💡',
        createdAt: '2024-01-18',
        updatedAt: '2024-10-02'
      },
      {
        id: 8,
        name: 'Spare Parts',
        slug: 'spare-parts',
        description: 'Bicycle parts and components',
        parentId: null,
        image: 'https://images.unsplash.com/photo-1581256106164-7b1b3a5f97e8?w=400',
        isActive: true,
        displayOrder: 3,
        productCount: 567,
        metaTitle: 'Bike Spare Parts Kenya',
        metaDescription: 'Quality bicycle spare parts',
        showInMenu: true,
        icon: '⚙️',
        createdAt: '2024-01-18',
        updatedAt: '2024-10-04'
      },
      {
        id: 9,
        name: 'Tires & Tubes',
        slug: 'tires-tubes',
        description: 'Bike tires and inner tubes',
        parentId: 8,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        isActive: true,
        displayOrder: 1,
        productCount: 145,
        metaTitle: 'Bike Tires Kenya',
        metaDescription: 'Durable bicycle tires and tubes',
        showInMenu: true,
        icon: '⭕',
        createdAt: '2024-01-19',
        updatedAt: '2024-09-30'
      },
      {
        id: 10,
        name: 'Brakes',
        slug: 'brakes',
        description: 'Brake systems and pads',
        parentId: 8,
        image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400',
        isActive: true,
        displayOrder: 2,
        productCount: 87,
        metaTitle: 'Bike Brakes Kenya',
        metaDescription: 'Reliable bicycle brake systems',
        showInMenu: true,
        icon: '🛑',
        createdAt: '2024-01-19',
        updatedAt: '2024-10-01'
      },
      {
        id: 11,
        name: 'Clothing',
        slug: 'clothing',
        description: 'Cycling apparel and jerseys',
        parentId: null,
        image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400',
        isActive: false,
        displayOrder: 4,
        productCount: 0,
        metaTitle: 'Cycling Clothing Kenya',
        metaDescription: 'Performance cycling apparel',
        showInMenu: false,
        icon: '👕',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-01'
      }
    ];
    
    setCategories(mockCategories);
    setFilteredCategories(mockCategories);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = categories;

    if (searchTerm) {
      result = result.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(cat => 
        filterStatus === 'active' ? cat.isActive : !cat.isActive
      );
    }

    setFilteredCategories(result);
  }, [searchTerm, filterStatus, categories]);

  // Build category tree
  const buildCategoryTree = (parentId = null) => {
    return filteredCategories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(cat => ({
        ...cat,
        children: buildCategoryTree(cat.id)
      }));
  };

  const categoryTree = buildCategoryTree();

  // Toggle category expansion
  const toggleExpand = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Select/deselect categories
  const toggleSelectCategory = (categoryId) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const selectAllCategories = () => {
    if (selectedCategories.size === filteredCategories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(filteredCategories.map(cat => cat.id)));
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: null,
      image: '',
      isActive: true,
      displayOrder: 0,
      metaTitle: '',
      metaDescription: '',
      showInMenu: true,
      icon: ''
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({ ...category });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  // Auto-generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  // Save category
  const handleSaveCategory = (e) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      const newCategory = {
        ...formData,
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        productCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setCategories([...categories, newCategory]);
      showNotification('Category created successfully!');
    } else {
      const updatedCategories = categories.map(cat => 
        cat.id === selectedCategory.id 
          ? { ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : cat
      );
      setCategories(updatedCategories);
      showNotification('Category updated successfully!');
    }
    
    closeModal();
  };

  // Delete category
  const handleDeleteCategory = (categoryId) => {
    const hasChildren = categories.some(cat => cat.parentId === categoryId);
    const category = categories.find(cat => cat.id === categoryId);
    
    if (hasChildren) {
      showNotification('Cannot delete category with subcategories', 'error');
      return;
    }

    if (category.productCount > 0) {
      if (!window.confirm(`This category has ${category.productCount} products. Delete anyway?`)) {
        return;
      }
    }

    setCategories(categories.filter(cat => cat.id !== categoryId));
    showNotification('Category deleted successfully!');
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (selectedCategories.size === 0) return;
    
    if (window.confirm(`Delete ${selectedCategories.size} selected categories?`)) {
      const categoriesWithChildren = Array.from(selectedCategories).filter(id =>
        categories.some(cat => cat.parentId === id)
      );
      
      if (categoriesWithChildren.length > 0) {
        showNotification('Cannot delete categories with subcategories', 'error');
        return;
      }

      setCategories(categories.filter(cat => !selectedCategories.has(cat.id)));
      setSelectedCategories(new Set());
      showNotification(`${selectedCategories.size} categories deleted!`);
    }
  };

  const handleBulkActivate = () => {
    if (selectedCategories.size === 0) return;
    
    const updatedCategories = categories.map(cat =>
      selectedCategories.has(cat.id) ? { ...cat, isActive: true } : cat
    );
    setCategories(updatedCategories);
    setSelectedCategories(new Set());
    showNotification(`${selectedCategories.size} categories activated!`);
  };

  const handleBulkDeactivate = () => {
    if (selectedCategories.size === 0) return;
    
    const updatedCategories = categories.map(cat =>
      selectedCategories.has(cat.id) ? { ...cat, isActive: false } : cat
    );
    setCategories(updatedCategories);
    setSelectedCategories(new Set());
    showNotification(`${selectedCategories.size} categories deactivated!`);
  };

  // Export categories
  const handleExport = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `categories-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Categories exported successfully!');
  };

  // Render category row
  const renderCategoryRow = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.has(category.id);

    return (
      <React.Fragment key={category.id}>
        <tr className={`border-b hover:bg-gray-50 ${!category.isActive ? 'opacity-60' : ''}`}>
          <td className="px-4 py-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleSelectCategory(category.id)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ marginLeft: `${level * 24}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              <div className="flex items-center gap-3">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xl">
                    {category.icon || '📁'}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{category.name}</div>
                  <div className="text-sm text-gray-500">{category.slug}</div>
                </div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {category.description}
          </td>
          <td className="px-4 py-3 text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {category.productCount}
            </span>
          </td>
          <td className="px-4 py-3 text-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-4 py-3 text-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.showInMenu 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {category.showInMenu ? <Eye size={12} /> : <EyeOff size={12} />}
            </span>
          </td>
          <td className="px-4 py-3 text-center text-sm text-gray-600">
            {category.displayOrder}
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => openEditModal(category)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && category.children.map(child => 
          renderCategoryRow(child, level + 1)
        )}
      </React.Fragment>
    );
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories Management</h1>
        <p className="text-gray-600">Organize your product catalog with categories and subcategories</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Categories</div>
          <div className="text-3xl font-bold text-gray-900">{categories.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Active Categories</div>
          <div className="text-3xl font-bold text-green-600">
            {categories.filter(c => c.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Parent Categories</div>
          <div className="text-3xl font-bold text-blue-600">
            {categories.filter(c => c.parentId === null).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Products</div>
          <div className="text-3xl font-bold text-purple-600">
            {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={18} />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCategories.size > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedCategories.size} selected
            </span>
            <button
              onClick={handleBulkActivate}
              className="text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="text-sm px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            >
              Deactivate
            </button>
            <button
              onClick={handleBulkDelete}
              className="text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCategories.size === filteredCategories.length && filteredCategories.length > 0}
                    onChange={selectAllCategories}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menu
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryTree.length > 0 ? (
                categoryTree.map(category => renderCategoryRow(category))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No categories found. Create your first category!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                {modalMode === 'create' ? 'Create New Category' : 'Edit Category'}
              </h2>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mountain Bikes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., mountain-bikes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of this category"
                />
              </div>

              {/* Parent Category & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      parentId: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">None (Top Level)</option>
                    {categories
                      .filter(cat => cat.parentId === null && cat.id !== selectedCategory?.id)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon/Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="🚴"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="mt-2 h-24 rounded object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
              </div>

              {/* SEO Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO-friendly title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO description (150-160 characters)"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <p className="mt-1 text-sm text-gray-500">Lower numbers appear first</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showInMenu}
                        onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Show in Menu</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-6 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalMode === 'create' ? 'Create Category' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;