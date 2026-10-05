import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  Navigation,
  Crosshair,
  Layers,
  Sparkles,
  Calendar,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Apartment } from '../types';
import {
  ETHIOPIA_BOUNDS,
  DEFAULT_ETHIOPIA_CENTER,
  isInsideEthiopia,
  calculateDistanceKm,
  reverseGeocodeEthiopia,
} from '../data/ethiopianLocations';
import { useTranslation } from '../i18n/LanguageContext';

interface EthiopiaMapExplorerProps {
  apartments: Apartment[];
  onSelectApartment: (apt: Apartment) => void;
  userCoords: { lat: number; lng: number } | null;
  onDropPin?: (coords: { lat: number; lng: number }) => void;
  selectedPinCoords?: { lat: number; lng: number } | null;
  isPinDropperEnabled?: boolean;
  selectedRadiusKm?: number;
  onSelectRadius?: (radiusKm: number | undefined) => void;
  onGpsLocate?: (coords: { lat: number; lng: number } | null) => void;
}

export const EthiopiaMapExplorer: React.FC<EthiopiaMapExplorerProps> = ({
  apartments,
  onSelectApartment,
  userCoords,
  onDropPin,
  selectedPinCoords,
  isPinDropperEnabled = true,
  selectedRadiusKm,
  onSelectRadius,
  onGpsLocate,
}) => {
  const { t, language } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const droppedPinMarkerRef = useRef<L.Marker | null>(null);
  const userLocationCircleRef = useRef<L.Circle | null>(null);

  const [activeDroppedCoords, setActiveDroppedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(selectedPinCoords || null);
  const [activeApartment, setActiveApartment] = useState<Apartment | null>(
    apartments[0] || null
  );
  const [pinModeActive, setPinModeActive] = useState(false);
  const [pinAddress, setPinAddress] = useState<string>('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Strict Ethiopia Bounding Box
    const southWest = L.latLng(ETHIOPIA_BOUNDS[0][0], ETHIOPIA_BOUNDS[0][1]);
    const northEast = L.latLng(ETHIOPIA_BOUNDS[1][0], ETHIOPIA_BOUNDS[1][1]);
    const ethiopiaBounds = L.latLngBounds(southWest, northEast);

    const initialCenter = userCoords
      ? [userCoords.lat, userCoords.lng]
      : DEFAULT_ETHIOPIA_CENTER;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter as [number, number],
      zoom: 12,
      minZoom: 6,
      maxZoom: 18,
      maxBounds: ethiopiaBounds,
      maxBoundsViscosity: 0.9,
    });

    // OpenStreetMap standard tile layer
    const tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Rentora Ethiopia',
        maxZoom: 19,
      }
    );
    tileLayer.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Click on map to drop exact pin (if pin mode enabled)
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (isInsideEthiopia(lat, lng)) {
        const roundedLat = Math.round(lat * 10000) / 10000;
        const roundedLng = Math.round(lng * 10000) / 10000;
        setActiveDroppedCoords({ lat: roundedLat, lng: roundedLng });
        if (onDropPin) {
          onDropPin({ lat: roundedLat, lng: roundedLng });
        }
        setIsReverseGeocoding(true);
        try {
          const res = await reverseGeocodeEthiopia(roundedLat, roundedLng);
          setPinAddress(res.address);
        } catch {
          setPinAddress(`${roundedLat.toFixed(4)}° N, ${roundedLng.toFixed(4)}° E, Ethiopia`);
        } finally {
          setIsReverseGeocoding(false);
        }
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Dropped Pin Marker with Draggability and Reverse Geocoding
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (droppedPinMarkerRef.current) {
      droppedPinMarkerRef.current.remove();
      droppedPinMarkerRef.current = null;
    }

    if (activeDroppedCoords) {
      const pinIcon = L.divIcon({
        className: 'custom-dropped-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl ring-4 ring-rose-300 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="w-2.5 h-2.5 bg-rose-600 rotate-45 -mt-1 mx-auto"></div>
          </div>
        `,
        iconSize: [36, 40],
        iconAnchor: [18, 40],
      });

      const marker = L.marker([activeDroppedCoords.lat, activeDroppedCoords.lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      // On Dragend: Reverse geocode
      marker.on('dragend', async (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        if (isInsideEthiopia(lat, lng)) {
          const rLat = Math.round(lat * 10000) / 10000;
          const rLng = Math.round(lng * 10000) / 10000;
          setActiveDroppedCoords({ lat: rLat, lng: rLng });
          if (onDropPin) onDropPin({ lat: rLat, lng: rLng });

          setIsReverseGeocoding(true);
          try {
            const geo = await reverseGeocodeEthiopia(rLat, rLng);
            setPinAddress(geo.address);
            marker.bindPopup(`
              <div class="p-2 text-xs font-sans">
                <div class="font-bold text-slate-900 mb-1">📍 Exact Dropped Location</div>
                <div class="text-slate-800 text-[11px] leading-snug mb-1 font-semibold">${geo.address}</div>
                <div class="text-slate-500 font-mono text-[10px]">${rLat.toFixed(4)}° N, ${rLng.toFixed(4)}° E</div>
              </div>
            `).openPopup();
          } catch {
            setPinAddress(`${rLat.toFixed(4)}° N, ${rLng.toFixed(4)}° E, Ethiopia`);
          } finally {
            setIsReverseGeocoding(false);
          }
        }
      });

      // Initial popup
      marker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <div class="font-bold text-slate-900 mb-1">📍 Dropped Location</div>
          <div class="text-slate-800 text-[11px] leading-snug mb-1 font-semibold">${pinAddress || 'Ethiopian Residence'}</div>
          <div class="text-slate-500 font-mono text-[10px]">${activeDroppedCoords.lat.toFixed(4)}° N, ${activeDroppedCoords.lng.toFixed(4)}° E</div>
        </div>
      `);

      droppedPinMarkerRef.current = marker;
    }
  }, [activeDroppedCoords, onDropPin]);

  // Update User GPS Location Marker & Visual Radius Circle (e.g. 2km, 5km, 10km)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocationCircleRef.current) {
      userLocationCircleRef.current.remove();
      userLocationCircleRef.current = null;
    }

    if (userCoords) {
      const radiusMeters = (selectedRadiusKm || 5) * 1000;
      const circle = L.circle([userCoords.lat, userCoords.lng], {
        radius: radiusMeters,
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);

      userLocationCircleRef.current = circle;
      map.flyTo(
        [userCoords.lat, userCoords.lng],
        selectedRadiusKm && selectedRadiusKm <= 2 ? 14 : selectedRadiusKm && selectedRadiusKm <= 5 ? 13 : 12,
        { duration: 1 }
      );
    }
  }, [userCoords, selectedRadiusKm]);

  // Update Apartment Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    apartments.forEach((apt) => {
      const formattedPrice =
        language === 'am'
          ? `${(apt.price / 1000).toFixed(0)}k ብር`
          : `${(apt.price / 1000).toFixed(0)}k ETB`;

      const dist = userCoords
        ? calculateDistanceKm(
            userCoords.lat,
            userCoords.lng,
            apt.coordinates.lat,
            apt.coordinates.lng
          )
        : null;

      const isCurrentSelected = activeApartment?.id === apt.id;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div class="transform transition-all ${isCurrentSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'}">
            <div class="px-2.5 py-1 rounded-full text-xs font-black shadow-lg border flex items-center gap-1 whitespace-nowrap ${
              isCurrentSelected
                ? 'bg-emerald-800 text-white border-white ring-2 ring-emerald-400'
                : apt.featured
                ? 'bg-slate-900 text-white border-amber-400'
                : 'bg-white text-slate-900 border-slate-300'
            }">
              <span>${formattedPrice}</span>
              ${dist !== null ? `<span class="text-[9px] opacity-80 pl-0.5">• ${dist}km</span>` : ''}
            </div>
            <div class="w-2 h-2 rotate-45 mx-auto -mt-1 ${isCurrentSelected ? 'bg-emerald-800' : 'bg-slate-900'}"></div>
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 28],
      });

      const marker = L.marker([apt.coordinates.lat, apt.coordinates.lng], {
        icon: customIcon,
      });

      marker.on('click', () => {
        setActiveApartment(apt);
      });

      marker.addTo(layer);
    });
  }, [apartments, activeApartment, language, userCoords]);

  const handleCenterOnUser = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let tLat = latitude;
        let tLng = longitude;
        if (!isInsideEthiopia(latitude, longitude)) {
          tLat = 8.9984;
          tLng = 38.7831;
        }

        if (onGpsLocate) {
          onGpsLocate({ lat: tLat, lng: tLng });
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([tLat, tLng], 14, { duration: 1 });
        }
        setIsLocating(false);
      },
      () => {
        if (onGpsLocate) onGpsLocate({ lat: 9.0108, lng: 38.7618 });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([9.0108, 38.7618], 13);
        }
        setIsLocating(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handleJumpToCity = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1 });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Map Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">{t('mapTitle')}</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
              {t('withinEthiopia')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t('mapSubtitle')}</p>
        </div>

        {/* Map Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* GPS Locate Button */}
          <button
            type="button"
            onClick={handleCenterOnUser}
            disabled={isLocating}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
          </button>

          {/* Toggle Pin Dropper Mode */}
          <button
            type="button"
            onClick={() => setPinModeActive(!pinModeActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              pinModeActive
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>{pinModeActive ? 'Drop Pin: ACTIVE' : 'Drop & Drag Pin'}</span>
          </button>
        </div>
      </div>

      {/* Regional Quick Jumps Toolbar */}
      <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Quick Jump:</span>
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
              className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 transition-colors"
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Radius Search / Near Me Buttons */}
        {onSelectRadius && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500">Radius:</span>
            {[
              { label: 'All', val: undefined },
              { label: '2km', val: 2 },
              { label: '5km', val: 5 },
              { label: '10km', val: 10 },
              { label: '25km', val: 25 },
            ].map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => onSelectRadius(r.val)}
                className={`px-2 py-0.5 text-[11px] rounded-md font-semibold border transition-all ${
                  selectedRadiusKm === r.val
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pin Dropper Instruction & Reverse Geocoded Feedback Banner */}
      {pinModeActive && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Click or drag pin to drop anywhere in Ethiopia.</span>
          </div>
          {activeDroppedCoords && (
            <div className="flex items-center gap-2 text-rose-950 font-bold">
              {isReverseGeocoding ? (
                <span className="flex items-center gap-1 text-[11px]">
                  <Loader2 className="w-3 h-3 animate-spin" /> Reverse Geocoding...
                </span>
              ) : pinAddress ? (
                <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-rose-200 shadow-2xs">
                  📍 {pinAddress}
                </span>
              ) : (
                <span className="font-mono text-[11px]">
                  {activeDroppedCoords.lat.toFixed(4)}° N, {activeDroppedCoords.lng.toFixed(4)}° E
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grid: Interactive Leaflet Map + Selected Apartment Inspection Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-8 relative">
          <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-10" />

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-slate-200 text-[11px] text-slate-700 flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span>Available</span>
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <span>Featured</span>
            </span>
            {userCoords && (
              <span className="flex items-center gap-1 font-semibold text-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>My Location {selectedRadiusKm ? `(${selectedRadiusKm}km circle)` : ''}</span>
              </span>
            )}
          </div>
        </div>

        {/* Selected Apartment Sidebar */}
        {activeApartment && (
          <div className="lg:col-span-4 p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 bg-white">
            <div className="space-y-4">
              {/* Photo preview */}
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 shadow-xs">
                <img
                  src={activeApartment.images[0]}
                  alt={activeApartment.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-900/85 text-white rounded-full text-[11px] font-bold backdrop-blur-md">
                  {activeApartment.neighborhood}
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-3 py-1 bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md">
                  {activeApartment.price.toLocaleString()} {t('currency')}/mo
                </div>
              </div>

              {/* Title & Distance */}
              <div>
                <h4 className="font-bold text-slate-900 text-base line-clamp-1">
                  {activeApartment.title}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">
                    {activeApartment.address}, {activeApartment.city}
                  </span>
                </p>

                {userCoords && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                    <Navigation className="w-3 h-3 text-emerald-600" />
                    <span>
                      {calculateDistanceKm(
                        userCoords.lat,
                        userCoords.lng,
                        activeApartment.coordinates.lat,
                        activeApartment.coordinates.lng
                      )}{' '}
                      km {t('distanceFromYou')}
                    </span>
                  </div>
                )}
              </div>

              {/* Core Layout Badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">
                    {t('bedrooms')}
                  </span>
                  <span>{activeApartment.bedrooms === 0 ? t('studio') : `${activeApartment.bedrooms} Bed`}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Bathrooms</span>
                  <span>{activeApartment.bathrooms} Bath</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Size</span>
                  <span>{activeApartment.sqft} m²</span>
                </div>
              </div>

              {/* Amenities Highlights */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('amenitiesTitle')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeApartment.amenities.slice(0, 4).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] rounded-lg font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Landlord mini profile */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={activeApartment.landlord.avatar}
                  alt={activeApartment.landlord.name}
                  className="w-9 h-9 rounded-full object-cover border border-emerald-500"
                />
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {activeApartment.landlord.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {t('respondsIn')} {activeApartment.landlord.responseTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center">
              <button
                onClick={() => onSelectApartment(activeApartment)}
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t('viewDetails')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
