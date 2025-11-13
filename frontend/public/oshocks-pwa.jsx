import React, { useRef, useEffect, useState } from 'react';
import { Download, Check, Copy, Smartphone, Monitor } from 'lucide-react';

export default function OshocksPWAIconGenerator() {
  const canvasRefs = {
    icon192: useRef(null),
    icon512: useRef(null),
    apple180: useRef(null),
    maskable192: useRef(null),
    maskable512: useRef(null)
  };
  
  const [copied, setCopied] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({});

  useEffect(() => {
    // Generate all PWA icons
    Object.entries(canvasRefs).forEach(([key, ref]) => {
      if (ref.current) {
        const size = key.includes('192') ? 192 : key.includes('180') ? 180 : 512;
        const isMaskable = key.includes('maskable');
        drawPWAIcon(ref.current, size, isMaskable);
      }
    });
  }, []);

  const drawPWAIcon = (canvas, size, isMaskable = false) => {
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    // Calculate safe zone padding (20% for maskable, 10% for regular)
    const padding = isMaskable ? size * 0.2 : size * 0.1;
    const contentSize = size - (padding * 2);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#FF6B4A');
    gradient.addColorStop(0.5, '#FF7A57');
    gradient.addColorStop(1, '#FF8A6B');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add subtle pattern for texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = size * 0.01;
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(size * 0.2, size * 0.3, size * 0.15 * i, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw main content area with safe zone
    ctx.save();
    ctx.translate(padding, padding);

    // Bicycle wheel (top left decorative element)
    const wheelSize = contentSize * 0.18;
    const wheelX = contentSize * 0.15;
    const wheelY = contentSize * 0.15;
    
    // Wheel outer circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = contentSize * 0.015;
    ctx.beginPath();
    ctx.arc(wheelX, wheelY, wheelSize, 0, Math.PI * 2);
    ctx.stroke();
    
    // Wheel spokes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = contentSize * 0.008;
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      ctx.beginPath();
      ctx.moveTo(wheelX, wheelY);
      ctx.lineTo(
        wheelX + Math.cos(angle) * wheelSize,
        wheelY + Math.sin(angle) * wheelSize
      );
      ctx.stroke();
    }
    
    // Wheel hub
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(wheelX, wheelY, wheelSize * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // "OS" Text - Main focal point
    const fontSize = contentSize * 0.5;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Text shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = contentSize * 0.03;
    ctx.shadowOffsetX = contentSize * 0.01;
    ctx.shadowOffsetY = contentSize * 0.01;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('OS', contentSize / 2, contentSize / 2);
    
    ctx.shadowColor = 'transparent';

    // Subtitle "OSHOCKS" - smaller text below
    const subtitleSize = contentSize * 0.12;
    ctx.font = `600 ${subtitleSize}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText('OSHOCKS', contentSize / 2, contentSize * 0.72);

    // Decorative cycling element - chain link pattern (bottom)
    const chainY = contentSize * 0.88;
    const chainSize = contentSize * 0.06;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = contentSize * 0.012;
    
    for (let i = 0; i < 5; i++) {
      const x = contentSize * 0.3 + (i * contentSize * 0.1);
      ctx.beginPath();
      ctx.arc(x, chainY, chainSize, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Accent corner elements (top right)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = contentSize * 0.01;
    ctx.beginPath();
    ctx.arc(contentSize * 0.85, contentSize * 0.15, contentSize * 0.08, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(contentSize * 0.85, contentSize * 0.15, contentSize * 0.12, 0, Math.PI * 2);
    ctx.stroke();

    // Bottom accent line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = contentSize * 0.02;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(contentSize * 0.2, contentSize * 0.95);
    ctx.lineTo(contentSize * 0.8, contentSize * 0.95);
    ctx.stroke();

    ctx.restore();

    // Draw safe zone guides for maskable icons
    if (isMaskable) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(padding, padding, contentSize, contentSize);
      ctx.setLineDash([]);
    }
  };

  const downloadIcon = (canvasRef, filename) => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      setDownloadStatus(prev => ({ ...prev, [filename]: true }));
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [filename]: false }));
      }, 2000);
    });
  };

  const downloadAll = () => {
    const icons = [
      { ref: canvasRefs.icon192, name: 'icon-192x192.png' },
      { ref: canvasRefs.icon512, name: 'icon-512x512.png' },
      { ref: canvasRefs.apple180, name: 'apple-touch-icon.png' },
      { ref: canvasRefs.maskable192, name: 'icon-192x192-maskable.png' },
      { ref: canvasRefs.maskable512, name: 'icon-512x512-maskable.png' }
    ];

    icons.forEach(({ ref, name }, index) => {
      setTimeout(() => downloadIcon(ref, name), index * 300);
    });
  };

  const manifestCode = `{
  "name": "Oshocks Junior Bike Shop - Kenya's Premier Cycling Marketplace",
  "short_name": "Oshocks",
  "description": "Discover thousands of bicycles, cycling accessories, and spare parts",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FF6B4A",
  "theme_color": "#FF6B4A",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "icon-192x192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any"
    },
    {
      "src": "icon-512x512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any"
    },
    {
      "src": "icon-192x192-maskable.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "maskable"
    },
    {
      "src": "icon-512x512-maskable.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "maskable"
    },
    {
      "src": "apple-touch-icon.png",
      "type": "image/png",
      "sizes": "180x180",
      "purpose": "any"
    }
  ]
}`;

  const htmlCode = `<!-- In your public/index.html <head> section -->

<!-- PWA Manifest -->
<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="%PUBLIC_URL%/apple-touch-icon.png" />

<!-- Theme Color -->
<meta name="theme-color" content="#FF6B4A" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Oshocks" />`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full shadow-lg mb-4">
            <Smartphone className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Oshocks PWA Icon Generator</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Professional Progressive Web App icons with safe zones & maskable variants
          </p>
        </div>

        {/* Download All Button */}
        <div className="text-center mb-8">
          <button
            onClick={downloadAll}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto"
          >
            <Download className="w-6 h-6" />
            Download All PWA Icons (5 files)
          </button>
        </div>

        {/* Icon Previews */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Standard Icons */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-lg">192×192px Standard</h3>
            </div>
            <div className="bg-slate-100 rounded-xl p-6 mb-4 flex items-center justify-center">
              <canvas ref={canvasRefs.icon192} className="max-w-full h-auto rounded-lg shadow-md" />
            </div>
            <button
              onClick={() => downloadIcon(canvasRefs.icon192, 'icon-192x192.png')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {downloadStatus['icon-192x192.png'] ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
            <p className="text-sm text-slate-600 mt-2">Android standard icon</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-lg">512×512px Standard</h3>
            </div>
            <div className="bg-slate-100 rounded-xl p-6 mb-4 flex items-center justify-center">
              <canvas ref={canvasRefs.icon512} className="max-w-full h-auto rounded-lg shadow-md" style={{maxHeight: '192px'}} />
            </div>
            <button
              onClick={() => downloadIcon(canvasRefs.icon512, 'icon-512x512.png')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {downloadStatus['icon-512x512.png'] ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
            <p className="text-sm text-slate-600 mt-2">High-res & splash screen</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">180×180px Apple</h3>
            </div>
            <div className="bg-slate-100 rounded-xl p-6 mb-4 flex items-center justify-center">
              <canvas ref={canvasRefs.apple180} className="max-w-full h-auto rounded-lg shadow-md" />
            </div>
            <button
              onClick={() => downloadIcon(canvasRefs.apple180, 'apple-touch-icon.png')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {downloadStatus['apple-touch-icon.png'] ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
            <p className="text-sm text-slate-600 mt-2">iOS home screen icon</p>
          </div>

          {/* Maskable Icons */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-lg">192×192px Maskable</h3>
            </div>
            <div className="bg-slate-100 rounded-xl p-6 mb-4 flex items-center justify-center">
              <canvas ref={canvasRefs.maskable192} className="max-w-full h-auto rounded-lg shadow-md" />
            </div>
            <button
              onClick={() => downloadIcon(canvasRefs.maskable192, 'icon-192x192-maskable.png')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {downloadStatus['icon-192x192-maskable.png'] ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
            <p className="text-sm text-slate-600 mt-2">Safe zone for adaptive icons</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-lg">512×512px Maskable</h3>
            </div>
            <div className="bg-slate-100 rounded-xl p-6 mb-4 flex items-center justify-center">
              <canvas ref={canvasRefs.maskable512} className="max-w-full h-auto rounded-lg shadow-md" style={{maxHeight: '192px'}} />
            </div>
            <button
              onClick={() => downloadIcon(canvasRefs.maskable512, 'icon-512x512-maskable.png')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {downloadStatus['icon-512x512-maskable.png'] ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
            <p className="text-sm text-slate-600 mt-2">High-res adaptive icon</p>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center">1</span>
            Update manifest.json
          </h2>
          <div className="bg-slate-900 rounded-xl p-6 relative">
            <button
              onClick={() => copyToClipboard(manifestCode, 'manifest')}
              className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              {copied === 'manifest' ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <pre className="text-green-400 text-sm overflow-x-auto">
              <code>{manifestCode}</code>
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center">2</span>
            Update index.html
          </h2>
          <div className="bg-slate-900 rounded-xl p-6 relative">
            <button
              onClick={() => copyToClipboard(htmlCode, 'html')}
              className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              {copied === 'html' ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <pre className="text-blue-400 text-sm overflow-x-auto">
              <code>{htmlCode}</code>
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center">3</span>
            Place Files & Test
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <div>
                <p className="font-medium">Place all downloaded PNG files in <code className="bg-slate-100 px-2 py-1 rounded text-sm">public/</code> directory</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <div>
                <p className="font-medium">Restart your dev server: <code className="bg-slate-100 px-2 py-1 rounded text-sm">npm start</code></p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <div>
                <p className="font-medium">Test PWA functionality:</p>
                <ul className="list-disc list-inside mt-2 text-slate-600 space-y-1 ml-4">
                  <li>Chrome: DevTools → Application → Manifest</li>
                  <li>Mobile: Add to Home Screen</li>
                  <li>Check Lighthouse PWA score</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-3 text-blue-900">✨ What Makes These Icons Special?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-blue-800 mb-1">🎯 Safe Zones</p>
              <p>10-20% padding ensures content isn't cropped by rounded corners</p>
            </div>
            <div>
              <p className="font-semibold text-purple-800 mb-1">🎭 Maskable Icons</p>
              <p>Adaptive icons that work with any shape (circle, square, rounded)</p>
            </div>
            <div>
              <p className="font-semibold text-orange-800 mb-1">🚀 PWA Ready</p>
              <p>All sizes required for full Progressive Web App support</p>
            </div>
            <div>
              <p className="font-semibold text-green-800 mb-1">📱 Cross-Platform</p>
              <p>Works perfectly on Android, iOS, and desktop installations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}