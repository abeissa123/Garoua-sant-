import React, { useMemo } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Facility } from '../data/facilities';
import { MapPin, Cross, Activity, Building2 } from 'lucide-react';

interface Map3DProps {
  facilities: Facility[];
  userLocation: { lat: number; lng: number } | null;
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility) => void;
}

export default function Map3D({ facilities, userLocation, selectedFacility, onSelectFacility }: Map3DProps) {
  // Garoua center coordinates
  const initialViewState = {
    longitude: 13.3917,
    latitude: 9.3000,
    zoom: 13.5,
    pitch: 60, // 3D perspective
    bearing: -20
  };

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
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="bottom">
            <div className="relative flex items-center justify-center w-8 h-8">
              <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-30 animate-ping"></div>
              <div className="relative bg-blue-600 border-2 border-white rounded-full w-4 h-4 shadow-md"></div>
            </div>
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
              
              {/* Tooltip on hover/select */}
              {(selectedFacility?.id === facility.id) && (
                <div className="absolute bottom-full mb-2 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-100 whitespace-nowrap z-50">
                  <p className="font-bold text-xs text-slate-800">{facility.name}</p>
                  <p className={`text-[10px] font-medium ${facility.isOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {facility.isOpen ? 'Ouvert' : 'Fermé'}
                  </p>
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
