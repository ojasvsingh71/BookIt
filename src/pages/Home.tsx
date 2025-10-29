import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Experience } from '../lib/api';
import { MapPin, Clock, Star } from 'lucide-react';

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const data = await api.getExperiences();
      setExperiences(data);
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-lg">Loading experiences...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">BookIt</h1>
          <p className="text-slate-600 mt-1">Discover unforgettable experiences</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Popular Experiences</h2>
          <p className="text-slate-600">Handpicked adventures just for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences?.map((experience) => (
            <div
              key={experience.id}
              onClick={() => navigate(`/experience/${experience.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={experience.image_url}
                  alt={experience.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 shadow-lg">
                  <span className="text-sm font-semibold text-slate-900">${experience.price}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {experience.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                  {experience.title}
                </h3>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                  {experience.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{experience.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{experience.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-900">{experience.rating}</span>
                    <span className="text-slate-500 text-sm">({experience.total_reviews})</span>
                  </div>
                  <button className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white mt-20 py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600">
          <p>&copy; 2025 BookIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
