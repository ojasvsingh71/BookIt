import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, ExperienceDetails as ExperienceDetailsType, Slot } from '../lib/api';
import { MapPin, Clock, Star, CheckCircle, Calendar, Users, ArrowLeft } from 'lucide-react';

export default function ExperienceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experience, setExperience] = useState<ExperienceDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [numGuests, setNumGuests] = useState(1);

  useEffect(() => {
    if (id) {
      loadExperience(id);
    }
  }, [id]);

  const loadExperience = async (experienceId: string) => {
    try {
      const data = await api.getExperienceById(experienceId);
      setExperience(data);
    } catch (error) {
      console.error('Error loading experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupSlotsByDate = (slots: Slot[]) => {
    const grouped: Record<string, Slot[]> = {};
    slots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleBooking = () => {
    if (!selectedSlot || !experience) return;

    const bookingData = {
      experience,
      slot: selectedSlot,
      numGuests,
      baseAmount: experience.price * numGuests,
    };

    navigate('/checkout', { state: bookingData });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-lg">Loading experience details...</div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-lg">Experience not found</div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate(experience.slots);
  const availableSlots = selectedSlot ? selectedSlot.capacity - selectedSlot.booked : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Experiences</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md">
              <div className="relative h-96">
                <img
                  src={experience.image_url}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block px-4 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {experience.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">{experience.rating}</span>
                    <span className="text-slate-500">({experience.total_reviews} reviews)</span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-slate-900 mb-4">{experience.title}</h1>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-5 h-5" />
                    <span>{experience.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-5 h-5" />
                    <span>{experience.duration}</span>
                  </div>
                </div>

                <p className="text-slate-700 text-lg leading-relaxed mb-8">{experience.description}</p>

                <div className="border-t border-slate-200 pt-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Highlights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {experience.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-8 mt-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">What's Included</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {experience.included.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Date & Time</h2>

              <div className="space-y-6">
                {Object.entries(groupedSlots).slice(0, 7).map(([date, slots]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-slate-600" />
                      <h3 className="font-semibold text-slate-900">{formatDate(date)}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slots.map((slot) => {
                        const available = slot.capacity - slot.booked;
                        const isSelected = selectedSlot?.id === slot.id;
                        const isFull = available === 0;

                        return (
                          <button
                            key={slot.id}
                            onClick={() => !isFull && setSelectedSlot(slot)}
                            disabled={isFull}
                            className={`
                              px-4 py-3 rounded-lg font-medium text-sm transition-all
                              ${isSelected
                                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-600 ring-offset-2'
                                : isFull
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-md'
                              }
                            `}
                          >
                            <div>{formatTime(slot.time)}</div>
                            <div className="text-xs mt-1">
                              {isFull ? 'Full' : `${available} left`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-md sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold text-slate-900">${experience.price}</div>
                <div className="text-slate-600 text-sm">per person</div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Guests
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNumGuests(Math.max(1, numGuests - 1))}
                      className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-semibold transition-colors"
                      disabled={numGuests <= 1}
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-5 h-5 text-slate-600" />
                        <span className="text-xl font-semibold text-slate-900">{numGuests}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setNumGuests(numGuests + 1)}
                      className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-semibold transition-colors"
                      disabled={selectedSlot ? numGuests >= availableSlots : false}
                    >
                      +
                    </button>
                  </div>
                </div>

                {selectedSlot && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{formatDate(selectedSlot.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-900">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{formatTime(selectedSlot.time)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>${experience.price} × {numGuests} guest{numGuests > 1 ? 's' : ''}</span>
                  <span>${(experience.price * numGuests).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>${(experience.price * numGuests).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!selectedSlot}
                className={`
                  w-full py-4 rounded-xl font-semibold text-lg transition-all
                  ${selectedSlot
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                {selectedSlot ? 'Continue to Checkout' : 'Select a Time Slot'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
