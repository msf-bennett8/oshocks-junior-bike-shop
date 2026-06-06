import { useState, useEffect } from 'react';
import {
  X, Download, QrCode, Calendar, MapPin, Users, Bike,
  DollarSign, Shield, Clock, Phone, Mail, CheckCircle,
  Printer, Share2, Copy, Check
} from 'lucide-react';
import eventService from '../../services/eventService';

const EventTicketModal = ({ isOpen, onClose, registrationCode }) => {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && registrationCode) {
      fetchTicket();
    }
  }, [isOpen, registrationCode]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.downloadTicket(registrationCode);
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
    
    const ticketCard = document.getElementById('ticket-card');
    if (!ticketCard) {
      // Fallback: download QR only
      const mimeType = ticketData.qr_mime_type || 'image/svg+xml';
      const extension = mimeType === 'image/svg+xml' ? 'svg' : 'png';
      const link = document.createElement('a');
      link.href = `data:${mimeType};base64,${ticketData.qr_base64}`;
      link.download = `ticket-${ticketData.registration_code}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

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
      pdf.save(`ticket-${ticketData.registration_code}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Falling back to QR download.');
      // Fallback to QR-only download
      const mimeType = ticketData.qr_mime_type || 'image/svg+xml';
      const extension = mimeType === 'image/svg+xml' ? 'svg' : 'png';
      const link = document.createElement('a');
      link.href = `data:${mimeType};base64,${ticketData.qr_base64}`;
      link.download = `ticket-${ticketData.registration_code}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyCode = () => {
    if (!ticketData?.registration_code) return;
    navigator.clipboard.writeText(ticketData.registration_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const reg = ticketData?.registration;
  const event = ticketData?.event;
  const bike = ticketData?.bike;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Event Ticket</h2>
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
            <div id="ticket-card" className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl border-2 border-indigo-100 p-6 relative overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <span className="text-8xl font-black text-indigo-900 rotate-[-15deg]">OSHACKS</span>
              </div>

              {/* Event Header */}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{event?.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{event?.event_code}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    PAID
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
                    Scan at check-in • Valid for {reg?.participant_count} participant{reg?.participant_count > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Registration Code */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <code className="bg-gray-900 text-white px-4 py-2 rounded-lg font-mono text-sm tracking-wider">
                    {ticketData.registration_code}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                  </button>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>{event?.start_datetime ? new Date(event.start_datetime).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{event?.start_datetime ? new Date(event.start_datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 col-span-2">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span>{event?.meeting_point || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>{reg?.participant_count} athlete{reg?.participant_count > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold">KSh {Number(reg?.final_amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Bike Info */}
                {bike && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Bike className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">Bike Rental Included</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      {bike.brand} {bike.model} • {bike.frame_size} • {bike.bike_condition}
                    </p>
                    {reg?.bike_add_ons && Object.keys(reg.bike_add_ons).length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Add-ons: {Object.entries(reg.bike_add_ons).filter(([_, v]) => v).map(([k]) => k).join(', ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Add-ons */}
                {reg?.add_ons && Object.values(reg.add_ons).some(Boolean) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {reg.add_ons.transport && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        🚐 Transport
                      </span>
                    )}
                    {reg.add_ons.insurance && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        🛡️ Insurance
                      </span>
                    )}
                    {reg.add_ons.nutrition && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        🥤 Nutrition
                      </span>
                    )}
                  </div>
                )}

                {/* Emergency Contact */}
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-xs font-semibold text-red-800 mb-1">Emergency Contact</p>
                  <div className="flex items-center gap-3 text-xs text-red-700">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {reg?.emergency_contact_name || '—'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {reg?.emergency_contact_phone || '—'}
                    </span>
                  </div>
                </div>

                {/* Security Seal */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Shield className="w-3 h-3" />
                  <span>Verified • {ticketData.issued_at} • Hash: {ticketData.signature?.slice(0, 8)}...</span>
                </div>

                {/* Terms */}
                <div className="mt-4 pt-3 border-t border-gray-200 text-[10px] text-gray-400 leading-relaxed">
                  <p>Refunds: {event?.refund_policy?.replace(/_/g, ' ') || 'See event page'} • 
                  Cancellation: {event?.cancellation_policy ? 'Available' : 'N/A'} • 
                  Weather: {event?.weather_policy ? 'Contingency plan active' : 'Standard'}</p>
                  <p className="mt-1">Present this ticket at check-in. Transfer requires admin approval. 
                  Lost tickets: Contact support with registration code.</p>
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
                      title: `Ticket: ${event?.title}`,
                      text: `My ticket for ${event?.title} — Code: ${ticketData.registration_code}`,
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

export default EventTicketModal;
