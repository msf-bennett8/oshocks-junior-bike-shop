import React, { useState } from 'react';
import { Search, Calendar, User, Tag, ArrowRight, TrendingUp, Book, Wrench, MapPin } from 'lucide-react';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Posts', icon: <Book className="w-4 h-4" /> },
    { id: 'maintenance', name: 'Bike Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { id: 'guides', name: 'Buying Guides', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'trails', name: 'Kenya Trails', icon: <MapPin className="w-4 h-4" /> },
    { id: 'tips', name: 'Cycling Tips', icon: <Book className="w-4 h-4" /> }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "The Ultimate Guide to Choosing Your First Mountain Bike in Kenya",
      excerpt: "Navigating the world of mountain bikes can be overwhelming. This comprehensive guide breaks down everything you need to know about frame sizes, suspension types, and terrain considerations specific to Kenyan cycling conditions.",
      category: "guides",
      author: "James Ochieng",
      date: "October 5, 2025",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80",
      featured: true,
      tags: ["Mountain Bikes", "Buying Guide", "Beginners"]
    },
    {
      id: 2,
      title: "Top 10 Cycling Trails Around Nairobi You Must Explore",
      excerpt: "From the challenging terrains of Karura Forest to the scenic routes of Ngong Hills, discover the best cycling trails in and around Nairobi. Complete with difficulty ratings, distance, and what to expect on each trail.",
      category: "trails",
      author: "Sarah Wanjiku",
      date: "October 3, 2025",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
      featured: true,
      tags: ["Nairobi", "Trail Guide", "Adventure"]
    },
    {
      id: 3,
      title: "Essential Bike Maintenance: A Monthly Checklist for Kenyan Conditions",
      excerpt: "Kenya's diverse terrain and weather conditions require special attention to bike maintenance. Learn how to keep your bicycle in peak condition with this practical monthly maintenance schedule designed for local riding conditions.",
      category: "maintenance",
      author: "Peter Kimani",
      date: "October 1, 2025",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      featured: false,
      tags: ["Maintenance", "DIY", "Care Tips"]
    },
    {
      id: 4,
      title: "Road Cycling vs Mountain Biking: Which is Right for You?",
      excerpt: "Exploring the key differences between road cycling and mountain biking to help you make an informed decision based on your fitness goals, budget, and the terrain you'll be riding in Kenya.",
      category: "guides",
      author: "James Ochieng",
      date: "September 28, 2025",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80",
      featured: false,
      tags: ["Comparison", "Road Bikes", "Mountain Bikes"]
    },
    {
      id: 5,
      title: "How to Stay Safe While Cycling in Nairobi Traffic",
      excerpt: "Essential safety tips for urban cyclists navigating Nairobi's busy streets. From choosing the right gear to understanding traffic patterns, this guide covers everything you need to ride safely in the city.",
      category: "tips",
      author: "Sarah Wanjiku",
      date: "September 25, 2025",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80",
      featured: false,
      tags: ["Safety", "Urban Cycling", "Nairobi"]
    },
    {
      id: 6,
      title: "Understanding Bike Gears: A Beginner's Complete Guide",
      excerpt: "Demystifying bike gears and learning when to shift for optimal performance. This beginner-friendly guide explains gear ratios, shifting techniques, and how to tackle Kenya's varied terrain with confidence.",
      category: "tips",
      author: "Peter Kimani",
      date: "September 22, 2025",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
      featured: false,
      tags: ["Beginners", "Techniques", "Education"]
    },
    {
      id: 7,
      title: "The Best Budget Bikes Under KSh 50,000 in 2025",
      excerpt: "Quality cycling doesn't have to break the bank. We review the top budget-friendly bicycles available in Kenya that offer excellent value for money without compromising on essential features and durability.",
      category: "guides",
      author: "James Ochieng",
      date: "September 20, 2025",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80",
      featured: false,
      tags: ["Budget", "Reviews", "2025"]
    },
    {
      id: 8,
      title: "How to Fix a Flat Tire: Step-by-Step Guide",
      excerpt: "Every cyclist will eventually face a flat tire. Learn how to quickly and efficiently repair or replace a punctured tube with this detailed step-by-step tutorial, complete with tips for preventing future flats.",
      category: "maintenance",
      author: "Peter Kimani",
      date: "September 18, 2025",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1511994714008-b6fc8e15f98e?w=800&q=80",
      featured: false,
      tags: ["Repair", "Tutorial", "DIY"]
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Oshocks Cycling Blog
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Tips, guides, and stories from Kenya's cycling community
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles, tips, trails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-4 gap-3 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Posts */}
        {selectedCategory === 'all' && searchTerm === '' && featuredPosts.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button className="text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'all' ? 'Latest Articles' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          
          {regularPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                        Read <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get the latest cycling tips, product reviews, and trail guides delivered straight to your inbox every week.
          </p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;