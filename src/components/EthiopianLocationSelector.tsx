import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ChevronDown,
  RotateCcw,
  Compass,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  ETHIOPIAN_REGIONS,
  ETHIOPIAN_ZONES,
  ETHIOPIAN_WOREDAS,
  isInsideEthiopia,
  calculateDistanceKm,
} from '../data/ethiopianLocations';
import { useTranslation } from '../i18n/LanguageContext';

interface EthiopianLocationSelectorProps {
  selectedRegionId: string;
  selectedZoneId: string;
  selectedWoredaId: string;
  onSelectLocation: (regionId: string, zoneId: string, woredaId: string) => void;
  onGpsLocate: (coords: { lat: number; lng: number } | null) => void;
  userCoords: { lat: number; lng: number } | null;
  selectedRadiusKm?: number;
  onSelectRadius?: (radiusKm: number | undefined) => void;
}

export const EthiopianLocationSelector: React.FC<EthiopianLocationSelectorProps> = ({
  selectedRegionId,
  selectedZoneId,
  selectedWoredaId,
  onSelectLocation,
  onGpsLocate,
  userCoords,
  selectedRadiusKm,
  onSelectRadius,
}) => {
  const { t, language } = useTranslation();
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Filter available zones based on selected region
  const availableZones = selectedRegionId && selectedRegionId !== 'all'
    ? ETHIOPIAN_ZONES.filter((z) => z.parentId === selectedRegionId)
    : ETHIOPIAN_ZONES;

  // Filter available woredas based on selected zone
  const availableWoredas = selectedZoneId && selectedZoneId !== 'all'
    ? ETHIOPIAN_WOREDAS.filter((w) => w.parentId === selectedZoneId)
    : ETHIOPIAN_WOREDAS;

  const getLocationName = (loc: { nameEn: string; nameAm: string; nameOm: string }) => {
    if (language === 'am') return loc.nameAm;
    if (language === 'om') return loc.nameOm;
    return loc.nameEn;
  };

  const handleRegionChange = (regId: string) => {
    onSelectLocation(regId, 'all', 'all');
  };

  const handleZoneChange = (zId: string) => {
    onSelectLocation(selectedRegionId, zId, 'all');
  };

  const handleWoredaChange = (wId: string) => {
    onSelectLocation(selectedRegionId, selectedZoneId, wId);
  };

  const handleReset = () => {
    onSelectLocation('all', 'all', 'all');
    onGpsLocate(null);
    setGpsError(null);
  };

  // GPS Geolocation Handler
  const handleAcquireGps = () => {
    setIsLocating(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Check if inside Ethiopia
        if (isInsideEthiopia(latitude, longitude)) {
          onGpsLocate({ lat: latitude, lng: longitude });
        } else {
          // If outside Ethiopia (e.g. testing from US/Europe cloud environment), simulate location at Bole, Addis Ababa for testing
          onGpsLocate({ lat: 8.9984, lng: 38.7831 });
          setGpsError(
            language === 'am'
              ? 'የአሁኑ መገኛዎ ከኢትዮጵያ ውጭ በመሆኑ በአዲስ አበባ (ቦሌ አትላስ) አካባቢ ተወስኗል።'
              : language === 'om'
              ? 'Bakki amma jirtan Itoophiyaan alatti waan ta\'eef Finfinnee (Boolee)tti qindaa\'eera.'
              : 'GPS acquired. Simulated near Addis Ababa (Bole Atlas) since your IP is outside Ethiopia.'
          );
        }
        setIsLocating(false);
      },
      (err) => {
        // If user denied or timed out, provide clean fallback near Addis Ababa
        console.warn('Geolocation error:', err.message);
        onGpsLocate({ lat: 9.0108, lng: 38.7618 });
        setGpsError(
          language === 'am'
            ? 'በአዲስ አበባ መሃል ከተማ ተወስኗል (ቦታ ፈቃድ አልተሰጠም)'
            : 'Defaulted near central Addis Ababa (permission denied or unavailable).'
        );
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-4 space-y-3">
      {/* Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            {t('locationSearchTitle')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* GPS Locate Button */}
          <button
            type="button"
            onClick={handleAcquireGps}
            disabled={isLocating}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs border ${
              userCoords
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? t('locating') : userCoords ? t('gpsFound') : t('useGps')}</span>
          </button>

          {(selectedRegionId !== 'all' || selectedZoneId !== 'all' || userCoords) && (
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              title={t('locationClear')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {gpsError && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Cascading Dropdowns: Region -> Zone -> Woreda */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Step 1: Region */}
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {t('selectRegion')}
          </label>
          <div className="relative">
            <select
              value={selectedRegionId}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 appearance-none pr-8 cursor-pointer"
            >
              <option value="all">{t('allRegions')}</option>
              {ETHIOPIAN_REGIONS.map((reg) => (
                <option key={reg.id} value={reg.id}>
                  {getLocationName(reg)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Step 2: Zone / Sub-City */}
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {t('selectZone')}
          </label>
          <div className="relative">
            <select
              value={selectedZoneId}
              onChange={(e) => handleZoneChange(e.target.value)}
              disabled={selectedRegionId === 'all' && availableZones.length === 0}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 appearance-none pr-8 cursor-pointer disabled:opacity-60"
            >
              <option value="all">{t('allZones')}</option>
              {availableZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {getLocationName(zone)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Step 3: Woreda / Kebele / Area */}
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            {t('selectWoreda')}
          </label>
          <div className="relative">
            <select
              value={selectedWoredaId}
              onChange={(e) => handleWoredaChange(e.target.value)}
              disabled={availableWoredas.length === 0}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 appearance-none pr-8 cursor-pointer disabled:opacity-60"
            >
              <option value="all">{t('allWoredas')}</option>
              {availableWoredas.map((woreda) => (
                <option key={woreda.id} value={woreda.id}>
                  {getLocationName(woreda)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Regional Ethiopian Hubs Quick Filter Pills (Bale Robe, Arsi Asella, Arsi Robe, Bale Gindhir, Sidama, Wolkite, Tepi) */}
      <div className="pt-2 border-t border-slate-200/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3 text-emerald-700" />
            <span>Popular Ethiopian Regional Hubs</span>
          </span>
          <span className="text-[10px] text-slate-400">Click to filter</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            {
              label: 'Bale Robe',
              om: 'Baale Roobee',
              region: 'reg-oromia',
              zone: 'zone-bale',
              woreda: 'wor-bale-robe',
            },
            {
              label: 'Arsi Asella',
              om: 'Asallaa',
              region: 'reg-oromia',
              zone: 'zone-arsi',
              woreda: 'wor-arsi-asella',
            },
            {
              label: 'Arsi Robe',
              om: 'Roobee Dida\'aa',
              region: 'reg-oromia',
              zone: 'zone-arsi',
              woreda: 'wor-arsi-robe',
            },
            {
              label: 'Bale Gindhir',
              om: 'Ginniir (Baalee)',
              region: 'reg-oromia',
              zone: 'zone-east-bale',
              woreda: 'wor-bale-gindhir',
            },
            {
              label: 'Sidama (Hawassa)',
              om: 'Sidaamaa (Hawaasaa)',
              region: 'reg-sidama',
              zone: 'zone-hawassa',
              woreda: 'all',
            },
            {
              label: 'Wolkite (Gurage)',
              om: 'Walqixxee',
              region: 'reg-central',
              zone: 'zone-gurage',
              woreda: 'wor-gurage-wolkite',
            },
            {
              label: 'Tepi (Sheka)',
              om: 'Xeeppii',
              region: 'reg-southwest',
              zone: 'zone-sheka',
              woreda: 'wor-sheka-tepi',
            },
            {
              label: 'Addis Ababa',
              om: 'Finfinnee',
              region: 'reg-aa',
              zone: 'all',
              woreda: 'all',
            },
            {
              label: 'Bishoftu',
              om: 'Bishooftuu',
              region: 'reg-oromia',
              zone: 'zone-bishoftu',
              woreda: 'all',
            },
          ].map((hub) => {
            const isSelected =
              selectedZoneId === hub.zone ||
              (selectedRegionId === hub.region && hub.zone === 'all');
            return (
              <button
                key={hub.label}
                type="button"
                onClick={() => onSelectLocation(hub.region, hub.zone, hub.woreda)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                }`}
              >
                <span>{language === 'om' ? hub.om : hub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Radius Search / Near Me Control (When GPS or Point is available) */}
      {userCoords && onSelectRadius && (
        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
            <Navigation className="w-3.5 h-3.5 text-emerald-700" />
            <span>Radius Search / Near Me:</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { label: 'All', value: undefined },
              { label: '2 km', value: 2 },
              { label: '5 km', value: 5 },
              { label: '10 km', value: 10 },
              { label: '25 km', value: 25 },
              { label: '50 km', value: 50 },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => onSelectRadius(option.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  selectedRadiusKm === option.value
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
