import React, { useState } from 'react';
import { Wrench, Calendar, CheckCircle, AlertTriangle, Search, Filter, Clock, Video, FileText, Download, Share2, Bookmark, ChevronDown, ChevronUp, Settings, Droplet, Cog, Gauge } from 'lucide-react';

const BikeMaintenance = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTask, setExpandedTask] = useState(null);
  const [bookmarkedTasks, setBookmarkedTasks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');

  const maintenanceSchedule = [
    {
      id: 1,
      task: 'Chain Cleaning and Lubrication',
      category: 'drivetrain',
      frequency: 'Every 100-200 km',
      difficulty: 'easy',
      duration: '15-20 minutes',
      importance: 'high',
      description: 'Clean and lubricate your chain to ensure smooth shifting and prevent premature wear.',
      tools: ['Chain cleaner', 'Degreaser', 'Chain lubricant', 'Rags', 'Brush'],
      steps: [
        'Shift to the smallest chainring and smallest rear cog',
        'Apply degreaser to the chain using a brush or chain cleaning tool',
        'Scrub the chain thoroughly, rotating the pedals backward',
        'Wipe the chain clean with a rag until no black residue appears',
        'Let the chain dry for 5 minutes',
        'Apply lubricant to each chain link while rotating pedals backward',
        'Wipe off excess lubricant with a clean rag',
        'Run through all gears to distribute lubricant evenly'
      ],
      tips: [
        'Clean your chain more frequently in wet or dusty conditions',
        'Use dry lube for dusty conditions, wet lube for rainy weather',
        'Never use WD-40 as a chain lubricant - it\'s a cleaner, not a lubricant',
        'A clean chain can improve shifting performance by up to 10%'
      ],
      videoUrl: '#',
      cost: 'KES 500-800 for supplies'
    },
    {
      id: 2,
      task: 'Tire Pressure Check',
      category: 'tires',
      frequency: 'Before every ride',
      difficulty: 'easy',
      duration: '5 minutes',
      importance: 'high',
      description: 'Maintain proper tire pressure for optimal performance, comfort, and puncture resistance.',
      tools: ['Floor pump with pressure gauge', 'Valve adapter (if needed)'],
      steps: [
        'Check the recommended pressure range printed on tire sidewall',
        'Remove valve cap and press gauge onto valve firmly',
        'Read current pressure on gauge',
        'Add air if pressure is below recommended range',
        'Release air if pressure is too high',
        'Check both tires and ensure pressures match',
        'Replace valve caps securely'
      ],
      tips: [
        'Road bikes: 80-130 PSI depending on rider weight',
        'Mountain bikes: 25-50 PSI depending on terrain and tubeless setup',
        'Lower pressure = more comfort and grip, higher pressure = less rolling resistance',
        'Temperature affects pressure - check before each ride',
        'Tires lose 1-2 PSI per week naturally'
      ],
      videoUrl: '#',
      cost: 'Free (requires pump: KES 2,000-8,000)'
    },
    {
      id: 3,
      task: 'Brake Pad Inspection',
      category: 'brakes',
      frequency: 'Every month',
      difficulty: 'medium',
      duration: '10-15 minutes',
      importance: 'critical',
      description: 'Inspect brake pads for wear to ensure safe stopping power and prevent rim or rotor damage.',
      tools: ['Hex keys', 'Flashlight', 'Ruler or caliper'],
      steps: [
        'For rim brakes: Check pad thickness (should be >1mm of material)',
        'For disc brakes: Look through caliper to check pad thickness (should be >1.5mm)',
        'Inspect for uneven wear patterns',
        'Check that pads contact rim or rotor surface properly',
        'Look for embedded debris in brake pads',
        'Test brake lever feel - should be firm, not spongy',
        'Replace pads if worn to wear indicators or below minimum thickness'
      ],
      tips: [
        'Rim brake pads should have visible grooves; replace when smooth',
        'Disc brake pads wear faster in wet and muddy conditions',
        'Always replace pads in pairs (both wheels)',
        'Contaminated pads can cause squealing - replace if oily',
        'Budget KES 800-2,000 for replacement pads per wheel'
      ],
      videoUrl: '#',
      cost: 'KES 800-3,000 for new pads'
    },
    {
      id: 4,
      task: 'Gear Adjustment',
      category: 'drivetrain',
      frequency: 'As needed or every 500 km',
      difficulty: 'medium',
      duration: '20-30 minutes',
      importance: 'medium',
      description: 'Fine-tune your derailleurs for smooth, precise shifting across all gears.',
      tools: ['Phillips and flathead screwdrivers', 'Hex keys', 'Cable cutters (if replacing cables)'],
      steps: [
        'Shift to highest gear (smallest cog) for rear derailleur',
        'Check cable tension - adjust barrel adjuster if shifts are sluggish',
        'Set high limit screw to prevent chain from going off smallest cog',
        'Set low limit screw to prevent chain from going off largest cog',
        'Shift through all gears and fine-tune with barrel adjuster',
        'Check front derailleur alignment and limit screws',
        'Test ride and make final adjustments',
        'Replace cables and housing if frayed or sticky'
      ],
      tips: [
        'Make small adjustments (quarter turns) and test',
        'Cable stretch is normal in new bikes - expect initial adjustments',
        'Clean derailleurs and pulleys before adjusting',
        'Watch YouTube tutorials specific to your derailleur brand',
        'Professional tune-up costs KES 1,500-3,000 if DIY seems daunting'
      ],
      videoUrl: '#',
      cost: 'KES 500-1,500 for cables/housing'
    },
    {
      id: 5,
      task: 'Wheel Truing',
      category: 'wheels',
      frequency: 'Every 1,000 km or as needed',
      difficulty: 'hard',
      duration: '30-60 minutes',
      importance: 'medium',
      description: 'Straighten wheels to eliminate wobbles and ensure smooth riding and braking.',
      tools: ['Spoke wrench', 'Truing stand (or use bike frame)', 'Marker'],
      steps: [
        'Mount wheel in truing stand or flip bike upside down',
        'Spin wheel and identify wobbles (lateral) and hops (radial)',
        'Mark high spots with marker or mental note',
        'Tighten spokes on opposite side to pull rim away from wobble',
        'Loosen spokes on wobble side if needed',
        'Make small adjustments (quarter turn max)',
        'Check dish (centering) between left and right sides',
        'Test spoke tension - should be tight and uniform',
        'Recheck brake alignment after truing'
      ],
      tips: [
        'Learn spoke patterns before attempting - mistakes can make it worse',
        'Practice on old wheels first',
        'Major wobbles or broken spokes require professional repair',
        'Properly tensioned wheels stay true longer',
        'Professional wheel truing: KES 800-1,500 per wheel'
      ],
      videoUrl: '#',
      cost: 'KES 200-500 for spoke wrench'
    },
    {
      id: 6,
      task: 'Bottom Bracket Service',
      category: 'drivetrain',
      frequency: 'Every 2,000 km or annually',
      difficulty: 'hard',
      duration: '45-90 minutes',
      importance: 'medium',
      description: 'Service or replace bottom bracket bearings to maintain efficient pedaling and prevent creaking.',
      tools: ['Bottom bracket tool', 'Torque wrench', 'Grease', 'Degreaser', 'Rags'],
      steps: [
        'Remove cranks using appropriate crank puller',
        'Remove bottom bracket using BB tool (direction depends on side)',
        'Clean BB shell thoroughly with degreaser',
        'Inspect bearings for wear, pitting, or roughness',
        'Apply fresh grease to threads and bearings if serviceable',
        'Install bottom bracket to manufacturer torque specs',
        'Reinstall cranks and torque to spec',
        'Check for smooth rotation and no play',
        'Test ride for any creaking or resistance'
      ],
      tips: [
        'BB standards vary - know your type before buying tools or parts',
        'Creaking can also come from pedals, chainring bolts, or seat post',
        'Sealed cartridge BBs are typically replaced, not serviced',
        'Consider professional service if unsure - KES 1,500-3,000',
        'Quality BBs last 3,000-5,000 km in Kenyan conditions'
      ],
      videoUrl: '#',
      cost: 'KES 1,500-8,000 for new BB'
    },
    {
      id: 7,
      task: 'Headset Adjustment',
      category: 'frame',
      frequency: 'Every 6 months or as needed',
      difficulty: 'medium',
      duration: '15-25 minutes',
      importance: 'medium',
      description: 'Adjust headset bearings to eliminate play and ensure smooth steering.',
      tools: ['Hex keys', 'Headset wrenches', 'Grease'],
      steps: [
        'Check for play by rocking bike front-to-back with front brake applied',
        'Check for roughness by lifting front wheel and turning handlebars',
        'Loosen stem bolts (do not remove completely)',
        'Adjust top cap to remove play but allow smooth rotation',
        'Align stem with front wheel',
        'Tighten stem bolts to torque spec in cross pattern',
        'Recheck for play and smooth rotation',
        'Test ride for proper handling'
      ],
      tips: [
        'Too tight causes notchy steering, too loose causes rattling',
        'Carbon steerers require torque wrench - over-tightening can crack',
        'Headset bearings rarely need replacement if properly adjusted',
        'Clean and regrease bearings annually for longevity',
        'Integrated headsets require special tools for bearing replacement'
      ],
      videoUrl: '#',
      cost: 'Free with basic tools'
    },
    {
      id: 8,
      task: 'Suspension Service (MTB)',
      category: 'suspension',
      frequency: 'Every 50 hours or 6 months',
      difficulty: 'hard',
      duration: '1-2 hours',
      importance: 'high',
      description: 'Service fork and shock to maintain performance, prevent damage, and ensure safety.',
      tools: ['Suspension oil', 'Seal kit', 'Hex keys', 'Torque wrench', 'Shock pump'],
      steps: [
        'Record current settings (air pressure, rebound, compression)',
        'Release all air pressure from fork/shock',
        'Remove lowers (fork) or disassemble shock per manufacturer',
        'Clean stanchions and seals thoroughly',
        'Inspect bushings, seals, and foam rings for wear',
        'Replace worn seals and foam rings',
        'Add fresh suspension oil to proper levels',
        'Reassemble and torque all bolts to spec',
        'Re-pressurize and reset to recorded settings',
        'Test for smooth travel and no leaks'
      ],
      tips: [
        'Different forks/shocks require different oils - check manual',
        'Full rebuild should be done annually by professional',
        'Lower leg service (described above) can be DIY every 50 hours',
        'Wipe stanchions clean after every ride to prevent seal damage',
        'Professional suspension service: KES 3,000-8,000'
      ],
      videoUrl: '#',
      cost: 'KES 2,000-5,000 for service kit'
    },
    {
      id: 9,
      task: 'Cable and Housing Replacement',
      category: 'drivetrain',
      frequency: 'Annually or every 3,000 km',
      difficulty: 'medium',
      duration: '45-60 minutes',
      importance: 'medium',
      description: 'Replace worn cables and housing for crisp shifting and braking performance.',
      tools: ['Cable cutters', 'Hex keys', 'Needle-nose pliers', 'Grease or cable lube'],
      steps: [
        'Shift to position that releases cable tension',
        'Cut cable end cap and remove old cable',
        'Remove housing from frame stops',
        'Measure and cut new housing to proper length',
        'Install ferrules on housing ends',
        'Thread new cable through shifter/lever',
        'Route housing and cable through frame',
        'Attach cable to derailleur/caliper',
        'Adjust tension and secure with pinch bolt',
        'Install new end cap on cable',
        'Fine-tune shifting/braking adjustment'
      ],
      tips: [
        'Replace cables and housing together for best results',
        'Use compressionless housing for brakes',
        'Lube cables before installation for smoother operation',
        'Take photos before disassembly to remember routing',
        'Stainless cables resist corrosion in wet conditions'
      ],
      videoUrl: '#',
      cost: 'KES 800-2,000 for complete set'
    },
    {
      id: 10,
      task: 'Frame Cleaning and Inspection',
      category: 'frame',
      frequency: 'After every ride (quick) / Monthly (deep)',
      difficulty: 'easy',
      duration: '20-45 minutes',
      importance: 'medium',
      description: 'Clean your bike and inspect frame for damage to prevent corrosion and catch issues early.',
      tools: ['Bike wash soap', 'Brushes', 'Sponges', 'Hose or bucket', 'Rags', 'Frame protector spray'],
      steps: [
        'Rinse bike with low-pressure water to remove loose dirt',
        'Apply bike-specific cleaner to frame, wheels, and components',
        'Scrub with soft brushes, avoiding bearings and seals',
        'Clean drivetrain separately with degreaser',
        'Rinse thoroughly with clean water',
        'Dry bike with clean towels',
        'Inspect frame for cracks, dents, or paint damage',
        'Check all bolts for tightness',
        'Apply frame protector or polish',
        'Lubricate chain and moving parts after drying'
      ],
      tips: [
        'Never use high-pressure washers - they force water into bearings',
        'Pay special attention to areas where cables enter frame',
        'Inspect welds and joints for stress cracks on metal frames',
        'Check carbon frames for delamination or unusual sounds when tapped',
        'Regular cleaning prevents corrosion and extends component life'
      ],
      videoUrl: '#',
      cost: 'KES 500-1,500 for cleaning supplies'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Tasks', icon: Wrench },
    { id: 'drivetrain', name: 'Drivetrain', icon: Cog },
    { id: 'brakes', name: 'Brakes', icon: Gauge },
    { id: 'tires', name: 'Tires & Wheels', icon: Settings },
    { id: 'wheels', name: 'Wheels', icon: Settings },
    { id: 'suspension', name: 'Suspension', icon: Droplet },
    { id: 'frame', name: 'Frame & Body', icon: Wrench }
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels', color: 'bg-gray-100 text-gray-800' },
    { id: 'easy', name: 'Easy', color: 'bg-green-100 text-green-800' },
    { id: 'medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'hard', name: 'Hard', color: 'bg-red-100 text-red-800' }
  ];

  const filteredTasks = maintenanceSchedule.filter(task => {
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || task.difficulty === selectedDifficulty;
    const matchesSearch = task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const toggleBookmark = (taskId) => {
    setBookmarkedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Bike Maintenance Guide</h1>
              <p className="text-blue-100 mt-2">Keep your bike running smoothly with proper maintenance</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">10 Essential Tasks</span>
              </div>
              <p className="text-sm text-blue-100 mt-1">Comprehensive maintenance schedule</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Save Time & Money</span>
              </div>
              <p className="text-sm text-blue-100 mt-1">DIY maintenance tutorials</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <span className="font-semibold">All Skill Levels</span>
              </div>
              <p className="text-sm text-blue-100 mt-1">From beginner to advanced</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'schedule'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Maintenance Schedule
            </button>
            <button
              onClick={() => setActiveTab('bookmarked')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'bookmarked'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Bookmark className="w-5 h-5 inline mr-2" />
              Saved Tasks ({bookmarkedTasks.length})
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search maintenance tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <cat.icon className="w-4 h-4" />
                        <span className="text-sm">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {difficulties.map(diff => (
                      <button
                        key={diff.id}
                        onClick={() => setSelectedDifficulty(diff.id)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          selectedDifficulty === diff.id
                            ? 'ring-2 ring-blue-600 shadow-md'
                            : 'hover:shadow'
                        } ${diff.color}`}
                      >
                        <span className="text-sm font-medium">{diff.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          ) : (
            filteredTasks
              .filter(task => activeTab === 'schedule' || bookmarkedTasks.includes(task.id))
              .map(task => (
                <div key={task.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-800">{task.task}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{task.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{task.frequency}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{task.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`w-4 h-4 ${getImportanceColor(task.importance)}`} />
                            <span className="capitalize">{task.importance} Priority</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBookmark(task.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          bookmarkedTasks.includes(task.id)
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Bookmark className={`w-6 h-6 ${bookmarkedTasks.includes(task.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        {expandedTask === task.id ? 'Hide Details' : 'Show Details'}
                        {expandedTask === task.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Video className="w-4 h-4" />
                        Watch Video
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>

                    {expandedTask === task.id && (
                      <div className="mt-6 pt-6 border-t space-y-6 animate-fadeIn">
                        {/* Required Tools */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-600" />
                            Required Tools
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {task.tools.map((tool, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Step by Step Instructions */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Step-by-Step Instructions
                          </h4>
                          <ol className="space-y-3">
                            {task.steps.map((step, index) => (
                              <li key={index} className="flex gap-3">
                                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  {index + 1}
                                </span>
                                <p className="text-gray-700 pt-1">{step}</p>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Pro Tips */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            Pro Tips & Best Practices
                          </h4>
                          <ul className="space-y-2">
                            {task.tips.map((tip, index) => (
                              <li key={index} className="flex gap-3 bg-yellow-50 p-3 rounded-lg">
                                <span className="text-yellow-600 font-bold">•</span>
                                <p className="text-gray-700">{tip}</p>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cost Estimate */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-green-600" />
                            Cost Estimate
                          </h4>
                          <p className="text-gray-700">{task.cost}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                          <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                            Mark as Completed
                          </button>
                          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Download className="w-5 h-5" />
                            Download PDF Guide
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Educational Resources Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Need Professional Help?</h2>
          <p className="text-blue-100 mb-6">
            While many maintenance tasks can be done at home, some require professional expertise. 
            Visit Oshocks Junior Bike Shop for expert service and genuine parts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Full Service</h3>
              <p className="text-sm text-blue-100 mb-3">Complete bike tune-up and inspection</p>
              <p className="text-2xl font-bold">KES 3,500</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Basic Service</h3>
              <p className="text-sm text-blue-100 mb-3">Essential maintenance and adjustments</p>
              <p className="text-2xl font-bold">KES 1,800</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Wheel Service</h3>
              <p className="text-sm text-blue-100 mb-3">Truing, spoke replacement, bearing service</p>
              <p className="text-2xl font-bold">KES 1,200</p>
            </div>
          </div>
          <button className="mt-6 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
            Book Service Appointment
          </button>
        </div>

        {/* Maintenance Tips Banner */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wrench className="w-6 h-6 text-blue-600" />
              Essential Maintenance Tools
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Multi-tool with hex keys (4mm, 5mm, 6mm)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Chain cleaning tool and lubricant</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Floor pump with pressure gauge</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Tire levers and spare tubes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Torque wrench (essential for carbon components)</span>
              </li>
            </ul>
            <button className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Shop Tools & Supplies
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Quick Maintenance Checklist
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-700">Before Every Ride</span>
                <span className="text-sm text-green-600">Daily</span>
              </div>
              <ul className="ml-4 space-y-1 text-sm text-gray-600">
                <li>• Check tire pressure</li>
                <li>• Test brakes</li>
                <li>• Quick visual inspection</li>
              </ul>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg mt-3">
                <span className="font-medium text-gray-700">Weekly Maintenance</span>
                <span className="text-sm text-yellow-600">Weekly</span>
              </div>
              <ul className="ml-4 space-y-1 text-sm text-gray-600">
                <li>• Clean chain and drivetrain</li>
                <li>• Check for unusual wear</li>
                <li>• Tighten loose bolts</li>
              </ul>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg mt-3">
                <span className="font-medium text-gray-700">Monthly Service</span>
                <span className="text-sm text-orange-600">Monthly</span>
              </div>
              <ul className="ml-4 space-y-1 text-sm text-gray-600">
                <li>• Deep clean entire bike</li>
                <li>• Inspect brake pads</li>
                <li>• Check gear adjustment</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">How often should I service my bike?</h3>
              <p className="text-gray-600">
                It depends on how much you ride. For regular riders (3-5 times per week), a basic service every 3 months 
                and a full service every 6 months is recommended. Casual riders can extend this to 6 months for basic 
                service and annually for full service. However, always perform pre-ride checks before every ride.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">What's the most important maintenance task?</h3>
              <p className="text-gray-600">
                Chain maintenance is arguably the most important. A clean, well-lubricated chain improves shifting, 
                extends the life of your drivetrain components (chainrings and cassette), and makes pedaling more 
                efficient. Clean and lube your chain every 100-200 km or after riding in wet or dusty conditions.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Can I use WD-40 on my bike chain?</h3>
              <p className="text-gray-600">
                No! WD-40 is a degreaser and water displacer, not a lubricant. While it's great for cleaning, it will 
                actually remove the lubricant from your chain. Use WD-40 to clean if you like, but always follow up 
                with a proper bike chain lubricant designed for cycling. Choose dry lube for dusty conditions or wet 
                lube for rainy weather.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">How do I know when to replace my brake pads?</h3>
              <p className="text-gray-600">
                For rim brakes, check the grooves on the pads - when they're worn smooth or less than 1mm of pad material 
                remains, replace them. For disc brakes, look through the caliper at the pads - if they're less than 1.5mm 
                thick or you hear metal-on-metal grinding, replace immediately. Also replace if contaminated with oil.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">What tire pressure should I use?</h3>
              <p className="text-gray-600">
                Check the sidewall of your tire for the recommended pressure range. Road bikes typically run 80-130 PSI, 
                mountain bikes 25-50 PSI, and hybrid bikes 50-70 PSI. Heavier riders should use higher pressure within 
                the range. Lower pressure gives more comfort and grip, higher pressure reduces rolling resistance. 
                Always check pressure before each ride as tires naturally lose 1-2 PSI per week.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Should I do maintenance myself or go to a shop?</h3>
              <p className="text-gray-600">
                Start with simple tasks like cleaning, chain lubrication, and tire pressure checks. As you gain confidence, 
                progress to brake and gear adjustments. However, tasks requiring special tools (bottom bracket service, 
                wheel building, suspension service) or those affecting safety (headset installation, carbon component 
                torque) are best left to professionals. Oshocks Junior Bike Shop offers both DIY workshops and professional 
                service - we're here to help you learn or to handle the complex stuff.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Keep Your Ride in Top Condition</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Regular maintenance not only extends the life of your bike but also ensures your safety on the road. 
            Shop quality maintenance supplies and tools at Oshocks Junior Bike Shop.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors shadow-lg">
              Shop Maintenance Supplies
            </button>
            <button className="px-8 py-4 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors shadow-lg">
              Schedule Professional Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BikeMaintenance;