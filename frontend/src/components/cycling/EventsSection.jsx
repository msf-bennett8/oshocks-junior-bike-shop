import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Filter, ArrowRight, Users, Trophy, PartyPopper, Heart } from 'lucide-react';
import EventCard from './EventCard';
import { MOCK_EVENTS } from '../../data/cyclingMockData';

const EventsSection = ({ onBookNow }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');

  const filters = [
    { key: 'all', label: 'All Events', icon: Calendar },
    { key: 'group_ride', label: 'Group Rides', icon: Users },
    { key: 'race', label: 'Races', icon: Trophy },
    { key: 'social', label: 'Social', icon: PartyPopper },
    { key: 'corporate', label: 'Corporate', icon: Users },
  ];

  const difficultyFilters = [
    { key: 'all', label: 'All Levels', color: 'bg-gray-100 text-gray-700' },
    { key: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700' },
    { key: 'intermediate', label: 'Intermediate', color: 'bg-orange-100 text-orange-700' },
    { key: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-700' },
  ];

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const typeMatch = activeFilter === 'all' || event.event_type === activeFilter;
    const diffMatch = activeDifficulty === 'all' || event.difficulty === activeDifficulty;
    return typeMatch && diffMatch;
  });

  const upcomingEvents = filteredEvents.filter(e => new Date(e.start_datetime) > new Date()).slice(0, 6);

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar className="w-3.5 h-3.5" />
              Upcoming Cycling Events
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ride With Us</h2>
            <p className="text-gray-600 mt-2 max-w-xl">
              Join organized rides, races, and social cycling events. From beginner-friendly city rides to advanced trail challenges.
            </p>
          </div>
          <Link 
            to="/events" 
            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all whitespace-nowrap"
          >
            Browse All Events
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col items-start gap-4 mb-8">
          {/* Event Type Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-0 sm:px-0 w-full">
            {filters.map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    activeFilter === f.key
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Difficulty Filters */}
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-0 sm:px-0 w-full">
            {difficultyFilters.map(df => (
              <button
                key={df.key}
                onClick={() => setActiveDifficulty(df.key)}
                className={`relative px-1 py-1.5 text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 bg-transparent ${
                  activeDifficulty === df.key
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {df.label}
                {activeDifficulty === df.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                onBookNow={onBookNow}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or check back soon for new rides.</p>
            <button 
              onClick={() => { setActiveFilter('all'); setActiveDifficulty('all'); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Want to organize your own ride? Submit a request and we will plan it for you.
          </p>
          <Link
            to="/ride-request"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all"
          >
            Request a Custom Ride
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;