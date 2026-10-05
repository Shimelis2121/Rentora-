import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  Crosshair,
  CheckCircle2,
  X,
  Sparkles,
  Loader2,
  Navigation,
} from 'lucide-react';
import {
  ETHIOPIA_BOUNDS,
  DEFAULT_ETHIOPIA_CENTER,
  isInsideEthiopia,
  reverseGeocodeEthiopia,
  ETHIOPIAN_REGIONS,
  ETHIOPIAN_ZONES,
  ETHIOPIAN_WOREDAS,
} from '../data/ethiopianLocations';
import { useTranslation } from '../i18n/LanguageContext';

interface PinDropperMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords: { lat: number; lng: number };
  onConfirmLocation: (result: {
    coordinates: { lat: number; lng: number };
    address: string;
    regionId?: string;
    zoneId?: string;
    woredaId?: string;
  }) => void;
}

export const PinDropperMapModal: React.FC<PinDropperMapModalProps> = ({
  isOpen,
  onClose,
  initialCoords,
  onConfirmLocation,
}) => {
  const { t, language } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(initialCoords);
  const [geocodedAddress, setGeocodedAddress] = useState<string>('Detecting Ethiopian address...');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [detectedLocationData, setDetectedLocationData] = useState<{
    regionId?: string;
    zoneId?: string;
    woredaId?: string;
  }>({});

  // Perform reverse geocoding when coords change
  const runGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const geo = await reverseGeocodeEthiopia(lat, lng);
      setGeocodedAddress(geo.address);
      setDetectedLocationData({
        regionId: geo.regionId,
        zoneId: geo.zoneId,
        woredaId: geo.woredaId,
      });
    } catch (err) {
      setGeocodedAddress(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E, Ethiopia`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const southWest = L.latLng(ETHIOPIA_BOUNDS[0][0], ETHIOPIA_BOUNDS[0][1]);
      const northEast = L.latLng(ETHIOPIA_BOUNDS[1][0], ETHIOPIA_BOUNDS[1][1]);
      const bounds = L.latLngBounds(southWest, northEast);

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        minZoom: 6,
        maxZoom: 19,
        maxBounds: bounds,
        maxBoundsViscosity: 0.9,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Rentora Ethiopia',
        maxZoom: 19,
      }).addTo(map);

      // Create Custom Draggable Marker Pin
      const pinIcon = L.divIcon({
        className: 'custom-pin-dropper',
        html: `
          <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-full">
            <div class="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-2xl ring-4 ring-emerald-300 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="w-3 h-3 bg-emerald-700 rotate-45 -mt-1 mx-auto"></div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        if (isInsideEthiopia(pos.lat, pos.lng)) {
          const rLat = Math.round(pos.lat * 10000) / 10000;
          const rLng = Math.round(pos.lng * 10000) / 10000;
          setCoords({ lat: rLat, lng: rLng });
          runGeocode(rLat, rLng);
        }
      });

      // Click on map to move pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (isInsideEthiopia(lat, lng)) {
          const rLat = Math.round(lat * 10000) / 10000;
          const rLng = Math.round(lng * 10000) / 10000;
          setCoords({ lat: rLat, lng: rLng });
          marker.setLatLng([rLat, rLng]);
          runGeocode(rLat, rLng);
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      runGeocode(coords.lat, coords.lng);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Use My Current Location (GPS)
  const handleUseCurrentLocation = () => {
    setIsLocatingGps(true);
    if (!navigator.geolocation) {
      setIsLocatingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let targetLat = latitude;
        let targetLng = longitude;

        if (!isInsideEthiopia(latitude, longitude)) {
          // If testing from cloud environment outside Ethiopia, simulate central Addis Ababa
          targetLat = 9.0108;
          targetLng = 38.7618;
        }

        const rLat = Math.round(targetLat * 10000) / 10000;
        const rLng = Math.round(targetLng * 10000) / 10000;

        setCoords({ lat: rLat, lng: rLng });
        if (markerRef.current) {
          markerRef.current.setLatLng([rLat, rLng]);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([rLat, rLng], 15, { duration: 1.2 });
        }
        runGeocode(rLat, rLng);
        setIsLocatingGps(false);
      },
      () => {
        // Fallback to central Addis Ababa
        setCoords({ lat: 9.0108, lng: 38.7618 });
        if (markerRef.current) markerRef.current.setLatLng([9.0108, 38.7618]);
        if (mapInstanceRef.current) mapInstanceRef.current.flyTo([9.0108, 38.7618], 14);
        runGeocode(9.0108, 38.7618);
        setIsLocatingGps(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Quick jump to major Ethiopian cities
  const handleJumpToCity = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    if (mapInstanceRef.current) mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1 });
    runGeocode(lat, lng);
  };

  const handleConfirm = () => {
    onConfirmLocation({
      coordinates: coords,
      address: geocodedAddress,
      regionId: detectedLocationData.regionId,
      zoneId: detectedLocationData.zoneId,
      woredaId: detectedLocationData.woredaId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {language === 'am'
                    ? 'የቤትዎን ትክክለኛ መገኛ በካርታው ላይ ያመልክቱ'
                    : language === 'om'
                    ? 'Bakka Mana Keessanii Kaartaa Irratti Filadhaa'
                    : 'Pinpoint Exact Property Location on Ethiopia Map'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'am'
                    ? 'ምልክቱን ጎትተው ያስቀምጡ ወይም ካርታውን ይጫኑ፤ አድራሻው በራስ-ሰር ይወሰዳል።'
                    : 'Drag the pin or click on the map to pinpoint. The address is automatically reverse geocoded.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: GPS + City Shortcuts */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* GPS Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocatingGps}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLocatingGps ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
            <span>{isLocatingGps ? 'Detecting GPS...' : 'Use My Current Location'}</span>
          </button>

          {/* City Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-semibold mr-1">Quick Jump:</span>
            {[
              { name: 'Addis Ababa', lat: 9.0108, lng: 38.7618 },
              { name: 'Bale Robe', lat: 7.1215, lng: 40.0034 },
              { name: 'Arsi Asella', lat: 7.9532, lng: 39.1345 },
              { name: 'Arsi Robe', lat: 7.8724, lng: 39.6312 },
              { name: 'Bale Gindhir', lat: 7.1398, lng: 40.7105 },
              { name: 'Hawassa (Sidama)', lat: 7.0548, lng: 38.4652 },
              { name: 'Wolkite', lat: 8.2814, lng: 37.7821 },
              { name: 'Tepi', lat: 7.2014, lng: 35.4312 },
            ].map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleJumpToCity(city.lat, city.lng)}
                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="relative flex-1 min-h-[380px] w-full bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />

          {/* Floating Instructions */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] text-slate-700 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>Drag the pin or click anywhere in Ethiopia</span>
          </div>
        </div>

        {/* Reverse Geocoding Result Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-3">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>Reverse Geocoded Address:</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isGeocoding ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 py-0.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Looking up Ethiopian administrative district...</span>
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                  {geocodedAddress}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Location & Use Address</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
