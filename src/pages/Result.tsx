import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Home, Calendar, Clock, MapPin, Mail, Phone } from 'lucide-react';
import { Booking, Experience, Slot } from '../lib/api';

interface ResultData {
  success: boolean;
  booking?: Booking;
  experience?: Experience;
  slot?: Slot;
  error?: string;
}

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state as ResultData;

  if (!data) {
    navigate('/');
    return null;
  }

  const { success, booking, experience, slot, error } = data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (success && booking && experience && slot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-green-100">Your adventure awaits</p>
            </div>

            <div className="p-8 space-y-8">
              <div className="text-center">
                <p className="text-slate-600 mb-2">Booking Reference</p>
                <p className="text-3xl font-bold text-slate-900 tracking-wider">{booking.booking_reference}</p>
                <p className="text-sm text-slate-500 mt-2">
                  Save this reference number for your records
                </p>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Booking Details</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={experience.image_url}
                        alt={experience.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{experience.title}</h3>
                      <div className="flex items-center gap-2 text-slate-600 text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{experience.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Date</span>
                      </div>
                      <p className="text-slate-900 font-semibold">{formatDate(slot.date)}</p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Time</span>
                      </div>
                      <p className="text-slate-900 font-semibold">{formatTime(slot.time)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Information</h2>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium">{booking.customer_email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-medium">{booking.customer_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Amount</span>
                    <span>${booking.base_amount.toFixed(2)}</span>
                  </div>
                  {booking.discount_amount > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Discount {booking.promo_code && `(${booking.promo_code})`}</span>
                        <span>-${booking.discount_amount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-2xl font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Paid</span>
                    <span>${booking.final_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-900 text-sm">
                  <strong>Important:</strong> A confirmation email has been sent to {booking.customer_email}.
                  Please arrive 15 minutes before your scheduled time.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Failed</h1>
            <p className="text-red-100">Something went wrong</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-slate-700 text-lg mb-4">
                We couldn't complete your booking at this time.
              </p>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-red-900 font-medium mb-1">Error Details:</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 text-sm">
                <strong>What you can do:</strong>
              </p>
              <ul className="list-disc list-inside text-slate-600 text-sm mt-2 space-y-1">
                <li>Check your internet connection</li>
                <li>Try selecting a different time slot</li>
                <li>Refresh the page and try again</li>
                <li>Contact support if the problem persists</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-4 bg-slate-200 text-slate-900 rounded-xl font-semibold text-lg hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
