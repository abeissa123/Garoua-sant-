import React, { useMemo, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Facility } from '../data/facilities';
import { MapPin, Cross, Activity, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Map3DProps {
  facilities: Facility[];
  userLocation: { lat: number; lng: number } | null;
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility) => void;
}

export default function Map3D({ facilities, userLocation, selectedFacility, onSelectFacility }: Map3DProps) {
  const mapRef = useRef<MapRef>(null);

  // Garoua center coordinates
  const initialViewState = {
    longitude: 13.3917,
    latitude: 9.3000,
    zoom: 13.5,
    pitch: 60, // 3D perspective
    bearing: -20
  };

  // Fly to user location when it becomes available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14.5,
        duration: 2000,
        essential: true
      });
    }
  }, [userLocation]);

  const getIcon = (type: string, isOpen: boolean) => {
    const colorClass = isOpen ? 'text-emerald-500' : 'text-rose-500';
    const bgClass = isOpen ? 'bg-emerald-100' : 'bg-rose-100';
    const borderClass = isOpen ? 'border-emerald-500' : 'border-rose-500';
    
    let Icon = Cross;
    if (type === 'hospital') Icon = Building2;
    if (type === 'clinic') Icon = Activity;

    return (
      <div className={`p-1.5 rounded-full border-2 shadow-lg ${bgClass} ${borderClass} transform transition-transform hover:scale-110`}>
        <Icon size={18} className={colorClass} />
      </div>
    );
  };

  return (
    <div className="w-full h-full relative bg-slate-100">
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
        maxPitch={85}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl 
          position="top-right" 
          trackUserLocation 
          showAccuracyCircle={false}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="bottom" style={{ zIndex: 20 }}>
            <motion.div 
              key={`${userLocation.lat}-${userLocation.lng}`}
              initial={{ scale: 0, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="relative flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                <div className="relative bg-blue-600 border-2 border-white rounded-full w-4 h-4 shadow-md"></div>
              </div>
              
              {/* Tooltip "Ma position" */}
              <div className="absolute bottom-full mb-1 bg-slate-800 px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap z-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <p className="font-bold text-xs text-white">Ma position exacte</p>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
              </div>
            </motion.div>
          </Marker>
        )}

        {/* Facilities Markers */}
        {facilities.map((facility) => (
          <Marker
            key={facility.id}
            longitude={facility.lng}
            latitude={facility.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectFacility(facility);
            }}
            style={{ zIndex: selectedFacility?.id === facility.id ? 10 : 1 }}
          >
            <div className="flex flex-col items-center cursor-pointer group">
              <div className={`transition-all duration-300 ${selectedFacility?.id === facility.id ? 'scale-125 -translate-y-2' : ''}`}>
                {getIcon(facility.type, facility.isOpen)}
              </div>
              
              {/* 3D shadow effect */}
              <div className="w-4 h-1 bg-black/20 rounded-full blur-[2px] mt-1 group-hover:w-6 transition-all"></div>
              
              {/* Permanent small label for exact position identification */}
              <div className={`mt-1 px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[9px] font-bold shadow-sm border border-slate-200/50 text-center max-w-[90px] truncate transition-opacity ${selectedFacility?.id === facility.id ? 'opacity-0' : 'opacity-100 text-slate-700'}`}>
                {facility.name}
              </div>
              
              {/* Tooltip on hover/select */}
              {(selectedFacility?.id === facility.id) && (
                <div className="absolute bottom-full mb-6 bg-white px-3 py-2 rounded-xl shadow-xl border border-slate-100 whitespace-nowrap z-50 min-w-[160px]">
                  <p className="font-bold text-sm text-slate-800">{facility.name}</p>
                  
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-600 font-medium">{facility.address}</p>
                  </div>

                  <div className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${facility.isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {facility.isOpen ? 'Ouvert' : 'Fermé'}
                  </div>
                  
                  {/* Little triangle pointing down */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-100"></div>
                </div>
              )}
            </div>
          </Marker>
        ))}
      </Map>
      
      {/* 3D Overlay Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]"></div>
    </div>
  );
}
