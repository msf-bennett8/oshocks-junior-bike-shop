import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar, Filter, ChevronRight, ArrowRight, MapPin,
  Clock, Users, Bike, Search, SlidersHorizontal, X, Plus
} from 'lucide-react';
import EventCard from '../../components/cycling/EventCard';
import DifficultyBadge from '../../components/cycling/DifficultyBadge';
import { useAuth } from '../../context/AuthContext';
import {
  MOCK_EVENTS,
  DIFFICULTY_CONFIG,
  TERRAIN_CONFIG,
  EVENT_TYPE_CONFIG
} from '../../data/cyclingMockData';
import eventService from '../../services/eventService';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [activeTerrain, setActiveTerrain] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  // Fetch real events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getEvents({
          per_page: 100,
          sort: 'start_datetime',
          order: 'asc',
        });
        const apiEvents = response.data?.data || [];
        setEvents(apiEvents.length > 0 ? apiEvents : MOCK_EVENTS);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents(MOCK_EVENTS); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const eventTypes = [
    { key: 'all', label: 'All Types', icon: Calendar },
    { key: 'group_ride', label: 'Group Rides', icon: Users },
    { key: 'race', label: 'Races', icon: Users },
    { key: 'social', label: 'Social', icon: Users },
    { key: 'corporate', label: 'Corporate', icon: Users },
    { key: 'charity', label: 'Charity', icon: Users },
    { key: 'training', label: 'Training', icon: Users },
  ];

  const difficulties = ['all', 'beginner', 'casual', 'intermediate', 'advanced', 'expert'];
  const terrains = ['all', 'road', 'gravel', 'mtb_trail', 'mixed'];
  const priceRanges = [
    { key: 'all', label: 'All Prices' },
    { key: 'under_1000', label: 'Under KSh 1,000' },
    { key: '1000_2500', label: 'KSh 1,000 - 2,500' },
    { key: '2500_5000', label: 'KSh 2,500 - 5,000' },
    { key: 'over_5000', label: 'Over KSh 5,000' },
  ];

  const filteredEvents = events.filter(event => {
    const searchMatch = !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.meeting_point.toLowerCase().includes(searchQuery.toLowerCase());

    const typeMatch = activeType === 'all' || event.event_type === activeType;
    const diffMatch = activeDifficulty === 'all' || event.difficulty === activeDifficulty;
    const terrainMatch = activeTerrain === 'all' || event.terrain === activeTerrain;

    let priceMatch = true;
    if (priceRange === 'under_1000') priceMatch = event.price_per_person < 1000;
    else if (priceRange === '1000_2500') priceMatch = event.price_per_person >= 1000 && event.price_per_person <= 2500;
    else if (priceRange === '2500_5000') priceMatch = event.price_per_person > 2500 && event.price_per_person <= 5000;
    else if (priceRange === 'over_5000') priceMatch = event.price_per_person > 5000;

    return searchMatch && typeMatch && diffMatch && terrainMatch && priceMatch;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(a.start_datetime) - new Date(b.start_datetime);
    if (sortBy === 'price_low') return a.price_per_person - b.price_per_person;
    if (sortBy === 'price_high') return b.price_per_person - a.price_per_person;
    if (sortBy === 'popular') return b.current_participants - a.current_participants;
    return 0;
  });

  const upcomingCount = events.filter(e => new Date(e.start_datetime) > new Date()).length;

  return (
    <>
      <Helmet>
        <title>Cycling Events & Rides - Oshocks</title>
        <meta name="description" content="Join organized cycling events, group rides, races, and social rides in Kenya. Book your spot today." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Header */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 border border-white/20">
                <Calendar className="w-4 h-4 text-orange-400" />
                {upcomingCount} Upcoming Events
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Cycling Events & Rides</h1>
              <p className="text-lg text-gray-300 mb-6">
                Discover group rides, races, charity events, and social cycling experiences across Kenya. 
                From beginner-friendly city rides to advanced trail challenges.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events by name, location, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Admin: Create Event Button */}
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <div className="mt-4">
                  <Link
                    to="/events/create"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-semibold text-white hover:bg-white/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Create Event
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Filters & Content */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <div className="flex items-center gap-2 mb-6">
                    <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-900">Filters</h3>
                  </div>

                  {/* Event Type */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Event Type</h4>
                    <div className="space-y-2">
                      {eventTypes.map(type => (
                        <button
                          key={type.key}
                          onClick={() => setActiveType(type.key)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeType === type.key
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Difficulty</h4>
                    <div className="space-y-2">
                      {difficulties.map(diff => (
                        <button
                          key={diff}
                          onClick={() => setActiveDifficulty(diff)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeDifficulty === diff
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {diff === 'all' ? (
                            <span className="w-3 h-3 rounded-full bg-gray-400" />
                          ) : (
                            <span className={`w-3 h-3 rounded-full ${DIFFICULTY_CONFIG[diff]?.color || 'bg-gray-400'}`} />
                          )}
                          {diff === 'all' ? 'All Levels' : DIFFICULTY_CONFIG[diff]?.label || diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terrain */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Terrain</h4>
                    <div className="space-y-2">
                      {terrains.map(terrain => (
                        <button
                          key={terrain}
                          onClick={() => setActiveTerrain(terrain)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTerrain === terrain
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Bike className="w-4 h-4" />
                          {terrain === 'all' ? 'All Terrains' : TERRAIN_CONFIG[terrain]?.label || terrain}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Price Range</h4>
                    <div className="space-y-2">
                      {priceRanges.map(range => (
                        <button
                          key={range.key}
                          onClick={() => setPriceRange(range.key)}
                          className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                            priceRange === range.key
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 shadow-sm"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters {activeType !== 'all' || activeDifficulty !== 'all' || activeTerrain !== 'all' ? '(Active)' : ''}
                </button>

                {showMobileFilters && (
                  <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Event Type</h4>
                      <div className="flex flex-wrap gap-2">
                        {eventTypes.map(type => (
                          <button
                            key={type.key}
                            onClick={() => setActiveType(type.key)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              activeType === type.key
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Difficulty</h4>
                      <div className="flex flex-wrap gap-2">
                        {difficulties.map(diff => (
                          <button
                            key={diff}
                            onClick={() => setActiveDifficulty(diff)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              activeDifficulty === diff
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {diff === 'all' ? 'All' : DIFFICULTY_CONFIG[diff]?.label || diff}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveType('all'); setActiveDifficulty('all'); setActiveTerrain('all'); setPriceRange('all'); }}
                      className="w-full py-2 text-sm text-orange-600 font-semibold"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="flex-1">
                {/* Sort & Count Bar */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredEvents.length}</span> events found
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="date">Date (Soonest)</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>

                {/* Events Grid */}
                {filteredEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onBookNow={(event) => window.location.href = `/events/${event.slug}/book`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveType('all');
                        setActiveDifficulty('all');
                        setActiveTerrain('all');
                        setPriceRange('all');
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EventsPage;