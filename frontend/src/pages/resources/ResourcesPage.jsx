import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, Search, Filter, Loader, Wrench, Tag, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import resourceService from '../../services/resourceService';
import toast from 'react-hot-toast';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'approved',
        is_active: true,
        per_page: 24,
        page: 1,
        ...(filterType !== 'all' && { resource_type: filterType }),
        ...(filterCategory && { category: filterCategory }),
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await resourceService.getResources(params);
      const items = response.data?.data?.data || response.data?.data || [];
      setResources(items);

      // Extract unique categories
      const cats = [...new Set(items.map(r => r.category).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filterType, filterCategory, searchQuery]);

  const getStockBadge = (resource) => {
    if (resource.available_quantity <= 0) {
      return { text: 'Out of Stock', class: 'bg-red-100 text-red-700' };
    }
    if (resource.is_low_stock) {
      return { text: resource.remaining_alert || 'Low Stock', class: 'bg-orange-100 text-orange-700' };
    }
    return { text: 'Available', class: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Equipment & Services | Resources</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Equipment & Services</h1>
          </div>
          <p className="text-gray-600">Rent equipment and book services for your cycling adventures</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="asset">Physical Equipment</option>
              <option value="ancillary">Services & Add-ons</option>
            </select>

            {categories.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources available</h3>
            <p className="text-gray-500">Check back later for new equipment and services</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => {
              const badge = getStockBadge(resource);
              return (
                <div
                  key={resource.resource_code}
                  onClick={() => navigate(`/resources/${resource.resource_code}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    <img
                      src={resource.images?.[0] || '/placeholder-resource.jpg'}
                      alt={resource.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        resource.resource_type === 'asset'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}>
                        {resource.resource_type === 'asset' ? 'Equipment' : 'Service'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                        {badge.text}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{resource.name}</h3>
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{resource.description}</p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{resource.formatted_price}</span>
                        {resource.surge_multiplier > 1.0 && (
                          <span className="text-xs text-orange-600 ml-1">
                            +{Math.round((resource.surge_multiplier - 1) * 100)}%
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{resource.category}</span>
                    </div>

                    {resource.dynamic_pricing_enabled && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Dynamic pricing
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
