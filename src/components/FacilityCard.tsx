import React from 'react';
import { Facility } from '../data/facilities';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { formatDistance } from '../utils/distance';
import { motion } from 'framer-motion';

interface FacilityCardProps {
  facility: Facility;
  distance?: number;
  onClick?: () => void;
  isActive?: boolean;
}

export default function FacilityCard({ facility, distance, onClick, isActive }: FacilityCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all ${
        isActive ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md' : 'border-slate-100 hover:border-emerald-200 hover:shadow-md'
      }`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-lg leading-tight">{facility.name}</h3>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">
            {facility.type === 'pharmacy' ? 'Pharmacie' : facility.type === 'hospital' ? 'Hôpital' : 'Clinique'}
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
          facility.isOpen 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {facility.isOpen ? 'Ouvert' : 'Fermé'}
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <span className="leading-tight">{facility.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400 shrink-0" />
          <span>{facility.openingHours}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-slate-400 shrink-0" />
          <span>{facility.phone}</span>
        </div>
      </div>

      {distance !== undefined && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg">
            <Navigation size={14} />
            <span className="text-sm">{formatDistance(distance)}</span>
          </div>
          <button className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors uppercase tracking-wide">
            Y aller
          </button>
        </div>
      )}
    </motion.div>
  );
}
