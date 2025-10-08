import React from 'react';

const ColorTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Oshocks Brand Style Guide</h1>
          <p className="text-gray-600">Complete color palette and component showcase</p>
        </div>

        {/* Primary Color Palette */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Primary Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="bg-purple-900 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Purple 900</p>
              <p className="text-xs text-gray-500">#3b1c5a</p>
            </div>
            <div className="space-y-2">
              <div className="bg-purple-700 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Purple 700</p>
              <p className="text-xs text-gray-500">#5b2b8a</p>
            </div>
            <div className="space-y-2">
              <div className="bg-purple-600 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Purple 600</p>
              <p className="text-xs text-gray-500">#667eea</p>
            </div>
            <div className="space-y-2">
              <div className="bg-purple-400 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Purple 400</p>
              <p className="text-xs text-gray-500">#a78bfa</p>
            </div>
            <div className="space-y-2">
              <div className="bg-purple-200 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Purple 200</p>
              <p className="text-xs text-gray-500">#ddd6fe</p>
            </div>
          </div>
        </section>

        {/* Secondary Color Palette */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Secondary Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="bg-indigo-900 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Indigo 900</p>
              <p className="text-xs text-gray-500">#312e81</p>
            </div>
            <div className="space-y-2">
              <div className="bg-indigo-700 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Indigo 700</p>
              <p className="text-xs text-gray-500">#4338ca</p>
            </div>
            <div className="space-y-2">
              <div className="bg-indigo-600 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Indigo 600</p>
              <p className="text-xs text-gray-500">#764ba2</p>
            </div>
            <div className="space-y-2">
              <div className="bg-indigo-400 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Indigo 400</p>
              <p className="text-xs text-gray-500">#818cf8</p>
            </div>
            <div className="space-y-2">
              <div className="bg-indigo-200 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Indigo 200</p>
              <p className="text-xs text-gray-500">#c7d2fe</p>
            </div>
          </div>
        </section>

        {/* Neutral Colors */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Neutral Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <div className="bg-gray-900 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Gray 900</p>
              <p className="text-xs text-gray-500">#111827</p>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-700 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Gray 700</p>
              <p className="text-xs text-gray-500">#374151</p>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-500 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Gray 500</p>
              <p className="text-xs text-gray-500">#6b7280</p>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-300 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Gray 300</p>
              <p className="text-xs text-gray-500">#d1d5db</p>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-100 h-24 rounded-lg shadow-md border border-gray-200"></div>
              <p className="font-semibold text-sm">Gray 100</p>
              <p className="text-xs text-gray-500">#f3f4f6</p>
            </div>
            <div className="space-y-2">
              <div className="bg-white h-24 rounded-lg shadow-md border border-gray-200"></div>
              <p className="font-semibold text-sm">White</p>
              <p className="text-xs text-gray-500">#ffffff</p>
            </div>
          </div>
        </section>

        {/* Accent Colors */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Accent Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="bg-green-600 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Success</p>
              <p className="text-xs text-gray-500">#16a34a</p>
            </div>
            <div className="space-y-2">
              <div className="bg-red-600 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Error</p>
              <p className="text-xs text-gray-500">#dc2626</p>
            </div>
            <div className="space-y-2">
              <div className="bg-yellow-500 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Warning</p>
              <p className="text-xs text-gray-500">#eab308</p>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-600 h-24 rounded-lg shadow-md"></div>
              <p className="font-semibold text-sm">Info</p>
              <p className="text-xs text-gray-500">#2563eb</p>
            </div>
          </div>
        </section>

        {/* Button Variants */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Styles</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Primary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md">
                  Primary Button
                </button>
                <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                  Secondary Button
                </button>
                <button className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md">
                  Dark Button
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Outline Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 border-2 border-purple-600 text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors">
                  Outline Primary
                </button>
                <button className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors">
                  Outline Secondary
                </button>
                <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Outline Neutral
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <button className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                  Small
                </button>
                <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  Medium
                </button>
                <button className="px-8 py-4 bg-purple-600 text-white text-lg font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  Large
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Action Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md">
                  Add to Cart
                </button>
                <button className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md">
                  Delete
                </button>
                <button className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Typography</h2>
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-gray-900">Heading 1 - 4xl Bold</h1>
            <h2 className="text-3xl font-bold text-gray-900">Heading 2 - 3xl Bold</h2>
            <h3 className="text-2xl font-semibold text-gray-900">Heading 3 - 2xl Semibold</h3>
            <h4 className="text-xl font-semibold text-gray-900">Heading 4 - xl Semibold</h4>
            <h5 className="text-lg font-medium text-gray-900">Heading 5 - lg Medium</h5>
            <p className="text-base text-gray-700">Body text - Base Regular. This is how regular paragraph text will appear throughout the application.</p>
            <p className="text-sm text-gray-600">Small text - sm Regular. Used for captions and secondary information.</p>
            <p className="text-xs text-gray-500">Extra small text - xs Regular. Used for labels and metadata.</p>
          </div>
        </section>

        {/* Card Components */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-600 to-indigo-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Card</h3>
                <p className="text-gray-600 mb-4">KSh 12,500</p>
                <button className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-600">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Featured Card</h3>
              <p className="text-gray-600 mb-4">Highlighted content with purple border</p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>Learn More →</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Gradient Card</h3>
              <p className="text-purple-100 mb-4">Special offers and promotions</p>
              <button className="px-4 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Elements</h2>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Input</label>
              <input 
                type="text" 
                placeholder="Enter text here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Dropdown</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="checkbox"
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
              />
              <label htmlFor="checkbox" className="text-sm text-gray-700">Checkbox option</label>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="radio" 
                id="radio"
                name="radio"
                className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600"
              />
              <label htmlFor="radio" className="text-sm text-gray-700">Radio option</label>
            </div>
          </div>
        </section>

        {/* Badges and Tags */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges & Tags</h2>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">New</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">In Stock</span>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Sale</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">Featured</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Best Seller</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">Out of Stock</span>
          </div>
        </section>

        {/* Alerts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Alert Messages</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border-l-4 border-green-600 rounded-lg">
              <p className="text-green-800 font-medium">Success! Your order has been placed.</p>
            </div>
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-lg">
              <p className="text-red-800 font-medium">Error! Please check your payment information.</p>
            </div>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-600 rounded-lg">
              <p className="text-yellow-800 font-medium">Warning! Low stock remaining.</p>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
              <p className="text-blue-800 font-medium">Info: Free shipping on orders over KSh 5,000.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ColorTest;