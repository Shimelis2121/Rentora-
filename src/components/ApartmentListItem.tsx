import React from 'react';
import {
  Heart,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  ShieldCheck,
  Sparkles,
  MapPin,
  Check,
  Navigation,
} from 'lucide-react';
import { Apartment } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ApartmentListItemProps {
  apartment: Apartment;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (apartment: Apartment) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (apartment: Apartment) => void;
}

export const ApartmentListItem: React.FC<ApartmentListItemProps> = ({
  apartment,
  isFavorite,
  onToggleFavorite,
  onSelect,
  isSelectedForCompare,
  onToggleCompare,
}) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={() => onSelect(apartment)}
      className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col md:flex-row cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative md:w-72 shrink-0 aspect-16/10 md:aspect-auto bg-slate-100 overflow-hidden">
        <img
          src={apartment.images[0]}
          alt={apartment.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 items-center">
          {apartment.featured && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-white rounded-full backdrop-blur-md shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {t('featured')}
            </span>
          )}
          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-900/80 text-white rounded-full backdrop-blur-md">
            {apartment.propertyType}
          </span>
          {apartment.distanceKm !== undefined && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-900/90 text-emerald-200 rounded-full backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Navigation className="w-2.5 h-2.5 text-emerald-400" />
              <span>{apartment.distanceKm} km</span>
            </span>
          )}
        </div>
      </div>

      {/* Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                {apartment.title}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  {apartment.address}, {apartment.neighborhood}, {apartment.city}
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {apartment.price.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-800 ml-1">
                {t('currencyPerMonth')}
              </span>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {apartment.description}
          </p>

          {/* Specs Bar */}
          <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-2xl">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-emerald-700" />
              <span>{apartment.bedrooms === 0 ? t('studio') : `${apartment.bedrooms} Bed`}</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-emerald-700" />
              <span>{apartment.bathrooms} Bath</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{apartment.sqft} m²</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <span className="text-slate-500 font-normal">
              {t('walkScore')}: <b className="text-slate-800 font-bold">{apartment.walkScore}</b>
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src={apartment.landlord.avatar}
              alt={apartment.landlord.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
            <span className="text-xs font-semibold text-slate-800">
              {apartment.landlord.name}
            </span>
            {apartment.landlord.verified && (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(apartment);
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                isSelectedForCompare
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('compare')}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(apartment.id);
              }}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => onSelect(apartment)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <span>{t('viewDetails')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
