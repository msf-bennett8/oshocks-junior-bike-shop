import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Filter, ChevronDown, ChevronRight, Package, Image, Save, X } from 'lucide-react';

const ManageCategories = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Complete Bikes',
      slug: 'complete-bikes',
      description: 'Full assembled bicycles ready to ride',
      parent: null,
      productsCount: 145,
      isActive: true,
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
      order: 1,
      children: [
        { id: 5, name: 'Mountain Bikes', slug: 'mountain-bikes', parent: 1, productsCount: 67, isActive: true, order: 1 },
        { id: 6, name: 'Road Bikes', slug: 'road-bikes', parent: 1, productsCount: 45, isActive: true, order: 2 },
        { id: 7, name: 'Hybrid Bikes', slug: 'hybrid-bikes', parent: 1, productsCount: 33, isActive: true, order: 3 }
      ]
    },
    {
      id: 2,
      name: 'Accessories',
      slug: 'accessories',
      description: 'Essential bike accessories and add-ons',
      parent: null,
      productsCount: 289,
      isActive: true,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      order: 2,
      children: [
        { id: 8, name: 'Lights', slug: 'lights', parent: 2, productsCount: 78, isActive: true, order: 1 },
        { id: 9, name: 'Locks', slug: 'locks', parent: 2, productsCount: 92, isActive: true, order: 2 },
        { id: 10, name: 'Bells & Horns', slug: 'bells-horns', parent: 2, productsCount: 45, isActive: true, order: 3 }
      ]
    },
    {
      id: 3,
      name: 'Spare Parts',
      slug: 'spare-parts',
      description: 'Replacement parts and components',
      parent: null,
      productsCount: 432,
      isActive: true,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
      order: 3,
      children: [
        { id: 11, name: 'Tires & Tubes', slug: 'tires-tubes', parent: 3, productsCount: 156, isActive: true, order: 1 },
        { id: 12, name: 'Brakes', slug: 'brakes', parent: 3, productsCount: 89, isActive: true, order: 2 },
        { id: 13, name: 'Chains & Gears', slug: 'chains-gears', parent: 3, productsCount: 112, isActive: true, order: 3 }
      ]
    },
    {
      id: 4,
      name: 'Cycling Gear',
      slug: 'cycling-gear',
      description: 'Apparel and protective equipment',
      parent: null,
      productsCount: 198,
      isActive: true,
      image: 'https://images.unsplash.com/photo-1532007859151-823dbc1e9b80?w=400',
      order: 4,
      children: [
        { id: 14, name: 'Helmets', slug: 'helmets', parent: 4, productsCount: 67, isActive: true, order: 1 },
        { id: 15, name: 'Gloves', slug: 'gloves', parent: 4, productsCount: 45, isActive: true, order: 2 },
        { id: 16, name: 'Jerseys', slug: 'jerseys', parent: 4, productsCount: 56, isActive: false, order: 3 }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [expandedCategories, setExpandedCategories] = useState([1, 2, 3, 4]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent: '',
    image: '',
    isActive: true,
    order: 1
  });

  const handleAddCategory = () => {
    setModalMode('add');
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent: '',
      image: '',
      isActive: true,
      order: categories.length + 1
    });
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent: category.parent || '',
      image: category.image || '',
      isActive: category.isActive,
      order: category.order
    });
    setShowModal(true);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const handleToggleActive = (categoryId) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const handleToggleExpand = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newCategory = {
        id: Date.now(),
        ...formData,
        productsCount: 0,
        children: []
      };
      setCategories([...categories, newCategory]);
    } else {
      setCategories(categories.map(cat => 
        cat.id === selectedCategory.id ? { ...cat, ...formData } : cat
      ));
    }
    setShowModal(false);
  };

  const handleNameChange = (value) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData({ ...formData, name: value, slug });
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Categories</h1>
          <p className="text-gray-600">Organize your product catalog with categories and subcategories</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Filter className="w-5 h-5" />
                Filter
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Categories</p>
                <p className="text-3xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Categories</p>
                <p className="text-3xl font-bold text-gray-900">
                  {categories.filter(cat => cat.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + cat.productsCount, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Subcategories</p>
                <p className="text-3xl font-bold text-gray-900">
                  {categories.reduce((sum, cat) => sum + (cat.children?.length || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <ChevronRight className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <React.Fragment key={category.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {category.children && category.children.length > 0 && (
                            <button
                              onClick={() => handleToggleExpand(category.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {expandedCategories.includes(category.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          )}
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Image className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{category.name}</p>
                            {category.description && (
                              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {category.slug}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {category.productsCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(category.id)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            category.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-600 font-medium">{category.order}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(category.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              category.isActive
                                ? 'text-gray-600 hover:bg-gray-100'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={category.isActive ? 'Hide' : 'Show'}
                          >
                            {category.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Subcategories */}
                    {expandedCategories.includes(category.id) && category.children && category.children.map((child) => (
                      <tr key={child.id} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3 pl-12">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-700">{child.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <code className="px-2 py-1 bg-white text-gray-600 rounded text-sm">
                            {child.slug}
                          </code>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                            {child.productsCount}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            child.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {child.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="text-gray-600 text-sm">{child.order}</span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="category-slug"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly version of the name</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                    placeholder="Brief description of this category"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formData.parent}
                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">None (Top Level)</option>
                    {categories.filter(cat => !cat.parent).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active (visible to customers)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {modalMode === 'add' ? 'Add Category' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;