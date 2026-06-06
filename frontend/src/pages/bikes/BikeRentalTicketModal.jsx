import { useState, useEffect } from 'react';
import {
  X, Download, QrCode, Calendar, MapPin, Bike, Clock,
  DollarSign, Shield, Phone, CheckCircle, Printer, Share2, Copy, Check
} from 'lucide-react';
import bikeService from '../../services/bikeService';

const BikeRentalTicketModal = ({ isOpen, onClose, bookingCode }) => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && bookingCode) {
      fetchTicket();
    }
  }, [isOpen, bookingCode]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bikeService.getBikeRentalTicket(bookingCode);
      setTicketData(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch ticket:', err);
      setError(err.response?.data?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!ticketData?.qr_base64) return;
    
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const ticketCard = document.getElementById('rental-ticket-card');
      if (!ticketCard) return;
      
      const canvas = await html2canvas(ticketCard, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`bike-rental-${ticketData.booking_code}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      // Fallback: download QR only
      const mimeType = ticketData.qr_mime_type || 'image/svg+xml';
      const extension = mimeType === 'image/svg+xml' ? 'svg' : 'png';
      const link = document.createElement('a');
      link.href = `data:${mimeType};base64,${ticketData.qr_base64}`;
      link.download = `ticket-${ticketData.booking_code}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyCode = () => {
    if (!ticketData?.booking_code) return;
    navigator.clipboard.writeText(ticketData.booking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const booking = ticketData?.booking;
  const bike = ticketData?.bike;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Bike Rental Ticket</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading ticket...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : ticketData ? (
          <div className="p-6 space-y-6">
            {/* Ticket Card */}
            <div id="rental-ticket-card" className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl border-2 border-indigo-100 p-6 relative overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <span className="text-8xl font-black text-indigo-900 rotate-[-15deg]">OSHACKS</span>
              </div>

              {/* Bike Header */}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{bike?.name}</h3>
                    <p className="text-sm text-gray-500">{bike?.brand} {bike?.model}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {booking?.payment_status === 'paid' ? 'PAID' : 'CONFIRMED'}
                  </span>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    {ticketData.qr_base64 ? (
                      <img
                        src={`data:image/svg+xml;base64,${ticketData.qr_base64}`}
                        alt="Ticket QR Code"
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                        <QrCode className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Scan at pickup • Booking reference
                  </p>
                </div>

                {/* Booking Code */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <code className="bg-gray-900 text-white px-4 py-2 rounded-lg font-mono text-sm tracking-wider">
                    {ticketData.booking_code}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                  </button>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>{booking?.start_datetime ? new Date(booking.start_datetime).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{booking?.start_datetime ? new Date(booking.start_datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 col-span-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span>{bike?.location_address || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Bike className="w-4 h-4 text-indigo-500" />
                    <span>{bike?.category || 'Bike'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold">KSh {Number(booking?.total_amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Add-ons */}
                {booking?.insurance_opt_in && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      🛡️ Insurance Included
                    </span>
                  </div>
                )}

                {booking?.delivery_opt_in && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      🚐 Delivery Requested
                    </span>
                  </div>
                )}

                {/* Security Seal */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Shield className="w-3 h-3" />
                  <span>Verified • {ticketData.issued_at} • Hash: {ticketData.signature?.slice(0, 8)}...</span>
                </div>

                {/* Terms */}
                <div className="mt-4 pt-3 border-t border-gray-200 text-[10px] text-gray-400 leading-relaxed">
                  <p>Present this ticket at pickup. Return bike by agreed date to avoid late fees.</p>
                  <p className="mt-1">Lost tickets: Contact support with booking code.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Bike Rental: ${bike?.name}`,
                      text: `My bike rental ticket — Code: ${ticketData.booking_code}`,
                      url: window.location.href,
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BikeRentalTicketModal;
