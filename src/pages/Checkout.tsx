import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, Experience, Slot } from '../lib/api';
import { ArrowLeft, Tag, Loader2, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface CheckoutData {
  experience: Experience;
  slot: Slot;
  numGuests: number;
  baseAmount: number;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state as CheckoutData;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!data) {
    navigate('/');
    return null;
  }

  const { experience, slot, numGuests, baseAmount } = data;
  const finalAmount = baseAmount - discount;

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    setValidatingPromo(true);
    setPromoError('');

    try {
      const result = await api.validatePromoCode(promoCode.toUpperCase(), baseAmount);

      if (result.valid && result.discount) {
        setDiscount(result.discount);
        setPromoApplied(true);
        setPromoError('');
      } else {
        setPromoError(result.error || 'Invalid promo code');
        setDiscount(0);
        setPromoApplied(false);
      }
    } catch (error) {
      setPromoError('Error validating promo code');
      setDiscount(0);
      setPromoApplied(false);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscount(0);
    setPromoApplied(false);
    setPromoError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const booking = await api.createBooking({
        experienceId: experience.id,
        slotId: slot.id,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        numGuests,
        baseAmount,
        discountAmount: discount,
        finalAmount,
        promoCode: promoApplied ? promoCode.toUpperCase() : undefined,
      });

      navigate('/result', {
        state: {
          success: true,
          booking,
          experience,
          slot,
        },
      });
    } catch (error) {
      navigate('/result', {
        state: {
          success: false,
          error: error instanceof Error ? error.message : 'Booking failed',
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-500' : 'border-slate-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-slate-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? 'border-red-500' : 'border-slate-300'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Promo Code</h2>
              <p className="text-slate-600 text-sm mb-4">
                Have a promo code? Enter it below to get a discount.
              </p>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={promoApplied}
                    placeholder="Enter promo code"
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                {!promoApplied ? (
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={validatingPromo || !promoCode.trim()}
                    className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {validatingPromo && <Loader2 className="w-4 h-4 animate-spin" />}
                    Apply
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {promoError && (
                <p className="text-red-600 text-sm mt-2">{promoError}</p>
              )}

              {promoApplied && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Promo code applied! You saved ${discount.toFixed(2)}
                  </p>
                </div>
              )}

              {!promoApplied && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-900 font-medium text-sm mb-2">Try these codes:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPromoCode('SAVE10')}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      SAVE10
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoCode('FLAT100')}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      FLAT100
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-md sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Booking Summary</h2>

              <div className="space-y-4">
                <div className="relative h-40 rounded-lg overflow-hidden">
                  <img
                    src={experience.image_url}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">{experience.title}</h3>
                  <div className="flex items-center gap-2 text-slate-600 text-sm mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{experience.location}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(slot.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(slot.time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{numGuests} Guest{numGuests > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>${experience.price} × {numGuests}</span>
                    <span>${baseAmount.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>${finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>

              <p className="text-xs text-slate-500 text-center">
                By confirming, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
