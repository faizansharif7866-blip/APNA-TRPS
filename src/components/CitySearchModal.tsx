import React, { useState } from 'react';
import { ArrowLeft, Search, Building2, MapPin, X } from 'lucide-react';

interface CitySearchModalProps {
  isOpen: boolean;
  title: string;
  currentValue: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
}

const POPULAR_CITIES = [
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Mumbai',
  'Delhi',
  'Coimbatore',
  'Vijayawada',
  'Visakhapatnam',
  'Ahmedabad',
  'Manali',
  'Goa',
  'Jaipur',
  'Aurangabad (Maharashtra)',
  'Kolkata',
  'Surat',
];

export const CitySearchModal: React.FC<CitySearchModalProps> = ({
  isOpen,
  title,
  currentValue,
  onSelectCity,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCities = POPULAR_CITIES.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200">
        
        {/* Header with Search Pill (Image 3) */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-700 hover:text-slate-950 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-2 bg-slate-100/90 rounded-full px-4 py-2 text-sm text-slate-800">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase() || 'city'}`}
              className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium text-sm"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Popular Cities Section (Exact matching Image 3) */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">
            Popular cities
          </h4>

          <div className="divide-y divide-slate-100">
            {filteredCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  onSelectCity(city);
                  onClose();
                }}
                className={`w-full py-3 px-2 flex items-center gap-3 text-left transition-colors hover:bg-red-50/50 rounded-lg group ${
                  currentValue.toLowerCase() === city.toLowerCase()
                    ? 'text-[#D84E55] font-bold'
                    : 'text-slate-700 font-medium'
                }`}
              >
                {/* Building silhouette icon as in redBus image 3 */}
                <Building2 className={`w-4 h-4 shrink-0 transition-colors ${
                  currentValue.toLowerCase() === city.toLowerCase()
                    ? 'text-[#D84E55]'
                    : 'text-slate-800 group-hover:text-[#D84E55]'
                }`} />
                <span className="text-sm">{city}</span>
              </button>
            ))}

            {filteredCities.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                No cities found matching "{searchQuery}". Select one of the major hubs.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
