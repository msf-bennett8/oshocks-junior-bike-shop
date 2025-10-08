import React from 'react';

const ColorTest = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-3xl font-bold text-primary-600">Oshocks Brand Colors</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary-500 text-white p-4 rounded-lg">
          <p className="font-semibold">Primary</p>
          <p className="text-sm">#667eea</p>
        </div>
        
        <div className="bg-secondary-500 text-white p-4 rounded-lg">
          <p className="font-semibold">Secondary</p>
          <p className="text-sm">#764ba2</p>
        </div>
        
        <button className="btn btn-primary">
          Primary Button
        </button>
        
        <button className="btn btn-outline">
          Outline Button
        </button>
      </div>
    </div>
  );
};

export default ColorTest;