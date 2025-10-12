import { useState } from 'react';
import { Ruler, User, AlertCircle, Info, ChevronDown, ChevronUp, Calculator, Bike, Shirt, Hand } from 'lucide-react';

const SizeGuide = ({ productType = 'bicycle', onClose }) => {
  const [activeCategory, setActiveCategory] = useState('bicycle');
  const [expandedSection, setExpandedSection] = useState(null);
  const [heightCm, setHeightCm] = useState('');
  const [inseamCm, setInseamCm] = useState('');
  const [recommendedSize, setRecommendedSize] = useState(null);

  const categories = [
    { id: 'bicycle', name: 'Bicycles', icon: Bike },
    { id: 'apparel', name: 'Apparel', icon: Shirt },
    { id: 'gloves', name: 'Gloves', icon: Hand },
    { id: 'shoes', name: 'Shoes', icon: User }
  ];

  const bicycleSizeChart = {
    road: [
      { size: 'XS', height: '148-158', inseam: '71-75', frame: '47-49' },
      { size: 'S', height: '158-168', inseam: '75-79', frame: '50-52' },
      { size: 'M', height: '168-178', inseam: '79-83', frame: '53-55' },
      { size: 'L', height: '178-188', inseam: '83-87', frame: '56-58' },
      { size: 'XL', height: '188-198', inseam: '87-91', frame: '59-61' },
      { size: 'XXL', height: '198+', inseam: '91+', frame: '62+' }
    ],
    mountain: [
      { size: 'XS', height: '150-160', inseam: '71-75', frame: '13-14', wheel: '26"/27.5"' },
      { size: 'S', height: '160-170', inseam: '75-79', frame: '15-16', wheel: '27.5"' },
      { size: 'M', height: '170-180', inseam: '79-83', frame: '17-18', wheel: '27.5"/29"' },
      { size: 'L', height: '180-190', inseam: '83-87', frame: '19-20', wheel: '29"' },
      { size: 'XL', height: '190-200', inseam: '87-91', frame: '21-22', wheel: '29"' },
      { size: 'XXL', height: '200+', inseam: '91+', frame: '23+', wheel: '29"' }
    ],
    kids: [
      { size: '12"', height: '85-100', age: '2-4', inseam: '35-42' },
      { size: '14"', height: '95-110', age: '3-5', inseam: '40-50' },
      { size: '16"', height: '105-120', age: '4-6', inseam: '45-55' },
      { size: '18"', height: '115-130', age: '5-7', inseam: '50-60' },
      { size: '20"', height: '125-140', age: '6-9', inseam: '55-65' },
      { size: '24"', height: '135-155', age: '8-12', inseam: '60-72' }
    ]
  };

  const apparelSizeChart = {
    jerseys: [
      { size: 'XS', chest: '81-86', waist: '66-71', hip: '81-86' },
      { size: 'S', chest: '86-91', waist: '71-76', hip: '86-91' },
      { size: 'M', chest: '91-97', waist: '76-81', hip: '91-97' },
      { size: 'L', chest: '97-102', waist: '81-86', hip: '97-102' },
      { size: 'XL', chest: '102-109', waist: '86-94', hip: '102-109' },
      { size: 'XXL', chest: '109-117', waist: '94-102', hip: '109-117' }
    ],
    shorts: [
      { size: 'XS', waist: '66-71', hip: '81-86', inseam: '20-22' },
      { size: 'S', waist: '71-76', hip: '86-91', inseam: '22-24' },
      { size: 'M', waist: '76-81', hip: '91-97', inseam: '24-26' },
      { size: 'L', waist: '81-86', hip: '97-102', inseam: '26-28' },
      { size: 'XL', waist: '86-94', hip: '102-109', inseam: '28-30' },
      { size: 'XXL', waist: '94-102', hip: '109-117', inseam: '30-32' }
    ]
  };

  const glovesSizeChart = [
    { size: 'XS', hand: '15-17', finger: '6-7' },
    { size: 'S', hand: '17-19', finger: '7-8' },
    { size: 'M', hand: '19-21', finger: '8-9' },
    { size: 'L', hand: '21-23', finger: '9-10' },
    { size: 'XL', hand: '23-25', finger: '10-11' },
    { size: 'XXL', hand: '25+', finger: '11+' }
  ];

  const shoesSizeChart = [
    { eu: '36', us: '4', uk: '3.5', cm: '22.5' },
    { eu: '37', us: '5', uk: '4', cm: '23' },
    { eu: '38', us: '5.5', uk: '4.5', cm: '23.5' },
    { eu: '39', us: '6.5', uk: '5.5', cm: '24.5' },
    { eu: '40', us: '7', uk: '6', cm: '25' },
    { eu: '41', us: '8', uk: '7', cm: '26' },
    { eu: '42', us: '8.5', uk: '7.5', cm: '26.5' },
    { eu: '43', us: '9.5', uk: '8.5', cm: '27.5' },
    { eu: '44', us: '10', uk: '9', cm: '28' },
    { eu: '45', us: '11', uk: '10', cm: '29' },
    { eu: '46', us: '12', uk: '11', cm: '30' },
    { eu: '47', us: '13', uk: '12', cm: '31' }
  ];

  const calculateBicycleSize = () => {
    const height = parseFloat(heightCm);
    const inseam = parseFloat(inseamCm);

    if (!height || !inseam) {
      setRecommendedSize({ error: 'Please enter both height and inseam measurements' });
      return;
    }

    const bikeType = 'road';
    const chart = bicycleSizeChart[bikeType];

    const recommended = chart.find(size => {
      const [minHeight, maxHeight] = size.height.includes('+') 
        ? [parseFloat(size.height), Infinity]
        : size.height.split('-').map(Number);
      const [minInseam, maxInseam] = size.inseam.includes('+')
        ? [parseFloat(size.inseam), Infinity]
        : size.inseam.split('-').map(Number);

      return height >= minHeight && height <= maxHeight && 
             inseam >= minInseam && inseam <= maxInseam;
    });

    if (recommended) {
      setRecommendedSize({
        size: recommended.size,
        frame: recommended.frame,
        message: `Based on your measurements, we recommend size ${recommended.size} with a ${recommended.frame}cm frame.`
      });
    } else {
      setRecommendedSize({
        error: 'Unable to find a recommended size. Please contact our support team for assistance.'
      });
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderMeasurementGuide = () => {
    const guides = {
      bicycle: [
        {
          title: 'How to Measure Your Height',
          steps: [
            'Stand against a wall without shoes',
            'Keep your heels, back, and head touching the wall',
            'Have someone mark the highest point of your head',
            'Measure from floor to the mark'
          ]
        },
        {
          title: 'How to Measure Your Inseam',
          steps: [
            'Stand barefoot with your back against a wall',
            'Place a book between your legs, spine up, snug against your crotch',
            'Mark where the top of the book meets the wall',
            'Measure from floor to the mark'
          ]
        }
      ],
      apparel: [
        {
          title: 'Chest Measurement',
          steps: [
            'Measure around the fullest part of your chest',
            'Keep the tape measure horizontal',
            'Ensure the tape is not too tight or loose'
          ]
        },
        {
          title: 'Waist Measurement',
          steps: [
            'Measure around your natural waistline',
            'Keep the tape measure horizontal',
            'Breathe normally, don\'t hold your stomach in'
          ]
        }
      ],
      gloves: [
        {
          title: 'Hand Circumference',
          steps: [
            'Measure around your palm at the widest point',
            'Exclude your thumb',
            'Use your dominant hand for measurement'
          ]
        }
      ],
      shoes: [
        {
          title: 'Foot Length',
          steps: [
            'Stand on a piece of paper',
            'Mark the heel and longest toe',
            'Measure the distance between marks',
            'Measure both feet and use the larger measurement'
          ]
        }
      ]
    };

    return guides[activeCategory] || [];
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ruler className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Size Guide</h2>
              <p className="text-orange-100 text-sm">Find your perfect fit</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="border-b">
        <div className="flex overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'border-b-2 border-orange-600 text-orange-600 bg-orange-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <cat.icon className="w-5 h-5" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeCategory === 'bicycle' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Calculator className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Size Calculator</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your measurements to get a personalized size recommendation
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="Enter your height"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Inseam (cm)
                    </label>
                    <input
                      type="number"
                      value={inseamCm}
                      onChange={(e) => setInseamCm(e.target.value)}
                      placeholder="Enter your inseam"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateBicycleSize}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Calculate My Size
                </button>

                {recommendedSize && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    recommendedSize.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                  }`}>
                    {recommendedSize.error ? (
                      <p className="text-red-700 text-sm">{recommendedSize.error}</p>
                    ) : (
                      <div>
                        <p className="font-bold text-green-800 text-lg mb-1">
                          Recommended Size: {recommendedSize.size}
                        </p>
                        <p className="text-green-700 text-sm">{recommendedSize.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-orange-600" />
            How to Measure
          </h3>
          <div className="space-y-3">
            {renderMeasurementGuide().map((guide, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(guide.title)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-left">{guide.title}</span>
                  {expandedSection === guide.title ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                {expandedSection === guide.title && (
                  <div className="p-4 bg-white">
                    <ol className="list-decimal list-inside space-y-2">
                      {guide.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="text-gray-700">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">Size Chart</h3>

          {activeCategory === 'bicycle' && (
            <div className="space-y-6">
              {['road', 'mountain', 'kids'].map(type => (
                <div key={type} className="overflow-x-auto">
                  <h4 className="font-semibold mb-3 capitalize">{type} Bikes</h4>
                  <table className="w-full border-collapse border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border px-4 py-2 text-left">Size</th>
                        <th className="border px-4 py-2 text-left">Height (cm)</th>
                        <th className="border px-4 py-2 text-left">Inseam (cm)</th>
                        <th className="border px-4 py-2 text-left">
                          {type === 'kids' ? 'Age (years)' : 'Frame (cm)'}
                        </th>
                        {bicycleSizeChart[type][0].wheel && (
                          <th className="border px-4 py-2 text-left">Wheel Size</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {bicycleSizeChart[type].map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border px-4 py-2 font-semibold">{row.size}</td>
                          <td className="border px-4 py-2">{row.height}</td>
                          <td className="border px-4 py-2">{row.inseam}</td>
                          <td className="border px-4 py-2">{row.frame || row.age}</td>
                          {row.wheel && (
                            <td className="border px-4 py-2">{row.wheel}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'apparel' && (
            <div className="space-y-6">
              {['jerseys', 'shorts'].map(type => (
                <div key={type} className="overflow-x-auto">
                  <h4 className="font-semibold mb-3 capitalize">{type}</h4>
                  <table className="w-full border-collapse border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border px-4 py-2 text-left">Size</th>
                        {Object.keys(apparelSizeChart[type][0]).filter(k => k !== 'size').map(key => (
                          <th key={key} className="border px-4 py-2 text-left capitalize">
                            {key} (cm)
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {apparelSizeChart[type].map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border px-4 py-2 font-semibold">{row.size}</td>
                          {Object.entries(row).filter(([k]) => k !== 'size').map(([key, val]) => (
                            <td key={key} className="border px-4 py-2">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {activeCategory === 'gloves' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2 text-left">Size</th>
                    <th className="border px-4 py-2 text-left">Hand Circumference (cm)</th>
                    <th className="border px-4 py-2 text-left">Middle Finger Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {glovesSizeChart.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 font-semibold">{row.size}</td>
                      <td className="border px-4 py-2">{row.hand}</td>
                      <td className="border px-4 py-2">{row.finger}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeCategory === 'shoes' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2 text-left">EU</th>
                    <th className="border px-4 py-2 text-left">US</th>
                    <th className="border px-4 py-2 text-left">UK</th>
                    <th className="border px-4 py-2 text-left">Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {shoesSizeChart.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 font-semibold">{row.eu}</td>
                      <td className="border px-4 py-2">{row.us}</td>
                      <td className="border px-4 py-2">{row.uk}</td>
                      <td className="border px-4 py-2">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Important Notes</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>All measurements are in centimeters unless otherwise stated</li>
                <li>If you're between sizes, we recommend sizing up for comfort</li>
                <li>Different brands may have slight variations in sizing</li>
                <li>Contact our support team if you need personalized sizing advice</li>
                <li>Check product-specific size guides as some items may fit differently</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;