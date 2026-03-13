import React, { useState, useEffect, useMemo } from 'react';
import { facilities, Facility } from './data/facilities';
import { calculateDistance } from './utils/distance';
import Map3D from './components/Map3D';
import AIAssistant from './components/AIAssistant';
import FacilityCard from './components/FacilityCard';
import Logo from './components/Logo';
import { Map as MapIcon, List, MessageSquareHeart, Cross, Activity, Building2, LocateFixed, Loader2, RefreshCw, Calendar, Clock, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'map' | 'list' | 'ai';
type Filter = 'all' | 'pharmacy' | 'hospital' | 'clinic';

const WEEK_DAYS = [
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mer' },
  { id: 4, label: 'Jeu' },
  { id: 5, label: 'Ven' },
  { id: 6, label: 'Sam' },
  { id: 0, label: 'Dim' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [facilitiesList, setFacilitiesList] = useState<Facility[]>(facilities);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  const refreshStatus = () => {
    setIsRefreshingStatus(true);
    
    // Simuler un léger délai de chargement pour l'UX
    setTimeout(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const updatedFacilities = facilities.map(f => {
        let isOpen = f.isOpen;
        
        // Logique de vérification des horaires
        if (f.openingHours.toLowerCase().includes('24h/24')) {
          isOpen = true; // Toujours ouvert
        } else {
          // Extraire les heures du format "08:00 - 20:00"
          const match = f.openingHours.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
          if (match) {
            const startMinutes = parseInt(match[1]) * 60 + parseInt(match[2]);
            const endMinutes = parseInt(match[3]) * 60 + parseInt(match[4]);
            
            if (endMinutes < startMinutes) {
              // Cas où ça ferme le lendemain (ex: 20:00 - 06:00)
              isOpen = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
            } else {
              // Cas normal (ex: 08:00 - 20:00)
              isOpen = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
            }
          }
        }
        return { ...f, isOpen };
      });

      setFacilitiesList(updatedFacilities);
      setIsRefreshingStatus(false);
    }, 800);
  };

  const refreshLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          // Default to Garoua center if denied or error
          setUserLocation({ lat: 9.3000, lng: 13.3917 });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation({ lat: 9.3000, lng: 13.3917 });
      setIsLocating(false);
    }
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  // Get user location on mount
  useEffect(() => {
    refreshLocation();
    refreshStatus();
  }, []);

  // Filter and sort facilities by distance
  const sortedFacilities = useMemo(() => {
    let filtered = facilitiesList.filter(f => f.daysOpen.includes(selectedDay));
    
    if (filter !== 'all') {
      filtered = filtered.filter(f => f.type === filter);
    }

    if (showOnlyOpen) {
      filtered = filtered.filter(f => f.isOpen);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(f => favorites.includes(f.id));
    }

    if (userLocation) {
      return [...filtered].sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }
    return filtered;
  }, [filter, userLocation]);

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility);
    if (activeTab !== 'map') {
      setActiveTab('map');
    }
  };

  return (
    <div className="h-screen w-full bg-slate-100 flex items-center justify-center overflow-hidden font-sans">
      {/* Mobile Simulator Container */}
      <div className="w-full h-full max-w-md bg-white relative shadow-2xl overflow-hidden flex flex-col sm:rounded-[2.5rem] sm:h-[850px] sm:border-[8px] border-slate-900">
        
        {/* Header */}
        <header className="bg-white px-5 pt-12 pb-4 shadow-sm z-20 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Logo className="w-11 h-11" />
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                  Garoua<span className="text-emerald-500">Santé</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Trouvez les soins les plus proches</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshStatus}
                disabled={isRefreshingStatus}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-full transition-colors flex items-center justify-center shadow-sm"
                title="Actualiser les statuts (Ouvert/Fermé)"
              >
                <RefreshCw size={20} className={isRefreshingStatus ? "animate-spin" : ""} />
              </button>
              <button
                onClick={refreshLocation}
                disabled={isLocating}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2.5 rounded-full transition-colors flex items-center justify-center shadow-sm"
                title="Actualiser ma position"
              >
                {isLocating ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <LocateFixed size={20} />
                )}
              </button>
            </div>
          </div>
          
          {/* Filters */}
          {activeTab !== 'ai' && (
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Tous" />
                <FilterButton active={filter === 'pharmacy'} onClick={() => setFilter('pharmacy')} icon={<Cross size={14} />} label="Pharmacies" />
                <FilterButton active={filter === 'hospital'} onClick={() => setFilter('hospital')} icon={<Building2 size={14} />} label="Hôpitaux" />
                <FilterButton active={filter === 'clinic'} onClick={() => setFilter('clinic')} icon={<Activity size={14} />} label="Cliniques" />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 shrink-0 border-r border-slate-200 pr-2 mr-1">
                  <button
                    onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      showOnlyOpen ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Clock size={14} />
                    Ouvert
                  </button>
                  <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      showFavoritesOnly ? 'bg-red-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <Heart size={14} className={showFavoritesOnly ? 'fill-current' : ''} />
                    Favoris
                  </button>
                </div>
                <Calendar size={16} className="text-slate-400 shrink-0" />
                {WEEK_DAYS.map(day => (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                      selectedDay === day.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>

              {/* Active Filters Summary */}
              {(filter !== 'all' || showOnlyOpen || showFavoritesOnly || selectedDay !== new Date().getDay()) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {filter !== 'all' && (
                    <button onClick={() => setFilter('all')} className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-200 transition-colors">
                      {filter === 'pharmacy' ? 'Pharmacies' : filter === 'hospital' ? 'Hôpitaux' : 'Cliniques'}
                      <X size={12} />
                    </button>
                  )}
                  {showOnlyOpen && (
                    <button onClick={() => setShowOnlyOpen(false)} className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium hover:bg-emerald-100 transition-colors">
                      Ouvert
                      <X size={12} />
                    </button>
                  )}
                  {showFavoritesOnly && (
                    <button onClick={() => setShowFavoritesOnly(false)} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium hover:bg-red-100 transition-colors">
                      Favoris
                      <X size={12} />
                    </button>
                  )}
                  {selectedDay !== new Date().getDay() && (
                    <button onClick={() => setSelectedDay(new Date().getDay())} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors">
                      {WEEK_DAYS.find(d => d.id === selectedDay)?.label}
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-slate-50">
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <Map3D 
                  facilities={sortedFacilities} 
                  userLocation={userLocation}
                  selectedFacility={selectedFacility}
                  onSelectFacility={setSelectedFacility}
                />
                
                {/* Floating Card on Map */}
                <AnimatePresence>
                  {selectedFacility && (
                    <motion.div 
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      className="absolute bottom-6 left-4 right-4 z-30"
                    >
                      <FacilityCard 
                        facility={selectedFacility} 
                        distance={userLocation ? calculateDistance(userLocation.lat, userLocation.lng, selectedFacility.lat, selectedFacility.lng) : undefined}
                        onClick={() => setSelectedFacility(null)}
                        isFavorite={favorites.includes(selectedFacility.id)}
                        onToggleFavorite={(e) => toggleFavorite(selectedFacility.id, e)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'list' && (
              <motion.div 
                key="list"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="absolute inset-0 overflow-y-auto p-4 space-y-4 pb-24"
              >
                {sortedFacilities.map(facility => (
                  <FacilityCard 
                    key={facility.id} 
                    facility={facility}
                    distance={userLocation ? calculateDistance(userLocation.lat, userLocation.lng, facility.lat, facility.lng) : undefined}
                    onClick={() => handleFacilitySelect(facility)}
                    isFavorite={favorites.includes(facility.id)}
                    onToggleFavorite={(e) => toggleFavorite(facility.id, e)}
                  />
                ))}
                {sortedFacilities.length === 0 && (
                  <div className="text-center text-slate-500 mt-10">
                    Aucun établissement trouvé pour ce filtre.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div 
                key="ai"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute inset-0 pb-16"
              >
                <AIAssistant />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-20 relative pb-safe">
          <NavButton 
            active={activeTab === 'map'} 
            onClick={() => setActiveTab('map')} 
            icon={<MapIcon size={24} />} 
            label="Carte 3D" 
          />
          <NavButton 
            active={activeTab === 'list'} 
            onClick={() => setActiveTab('list')} 
            icon={<List size={24} />} 
            label="Liste" 
          />
          <NavButton 
            active={activeTab === 'ai'} 
            onClick={() => setActiveTab('ai')} 
            icon={<MessageSquareHeart size={24} />} 
            label="Assistant IA" 
          />
        </nav>
      </div>
    </div>
  );
}

// Helper Components
function FilterButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon?: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
        active 
          ? 'bg-emerald-600 text-white shadow-md' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${
        active ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-emerald-50' : 'bg-transparent'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
