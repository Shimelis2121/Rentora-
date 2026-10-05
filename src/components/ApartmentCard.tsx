import React, { useState } from 'react';
import {
  Heart,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Check,
  Navigation,
} from 'lucide-react';
import { Apartment } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ApartmentCardProps {
  apartment: Apartment;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (apartment: Apartment) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (apartment: Apartment) => void;
}

export const ApartmentCard: React.FC<ApartmentCardProps> = ({
  apartment,
  isFavorite,
  onToggleFavorite,
  onSelect,
  isSelectedForCompare,
  onToggleCompare,
}) => {
  const { t, language } = useTranslation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % apartment.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + apartment.images.length) % apartment.images.length);
  };

  return (
    <div
      onClick={() => onSelect(apartment)}
      className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer relative"
    >
      {/* Image Carousel */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={apartment.images[activeImageIndex] || apartment.images[0]}
          alt={apartment.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Carousel controls */}
        {apartment.images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="w-8 h-8 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-md hover:bg-white transition-all transform hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="w-8 h-8 rounded-full bg-white/90 text-slate-800 flex items-center justify-center shadow-md hover:bg-white transition-all transform hover:scale-105"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          {apartment.featured && (
            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-emerald-800 text-white rounded-full backdrop-blur-md shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {t('featured')}
            </span>
          )}
          <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900/80 text-white rounded-full backdrop-blur-md">
            {apartment.propertyType}
          </span>
          {apartment.distanceKm !== undefined && (
            <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-900/90 text-emerald-200 rounded-full backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Navigation className="w-3 h-3 text-emerald-400" />
              <span>{apartment.distanceKm} km</span>
            </span>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {/* Compare toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(apartment);
            }}
            title={isSelectedForCompare ? 'Remove from comparison' : 'Compare apartment'}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isSelectedForCompare
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white/85 text-slate-700 hover:bg-white'
            }`}
          >
            <Check className="w-4 h-4" />
          </button>

          {/* Favorite heart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(apartment.id);
            }}
            title={isFavorite ? 'Remove favorite' : 'Save to favorites'}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/85 text-slate-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Dots indicator */}
        {apartment.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-black/30 backdrop-blur-xs rounded-full">
            {apartment.images.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === activeImageIndex ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price and Deposit in ETB */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {apartment.price.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                {t('currencyPerMonth')}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {t('depositLabel')}: {apartment.deposit.toLocaleString()} {t('currency')}
            </span>
          </div>

          {/* Title & Location */}
          <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
            {apartment.title}
          </h3>

          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              {apartment.address}, {apartment.neighborhood}, {apartment.city}
            </span>
          </p>

          {/* Core Specs */}
          <div className="mt-3.5 flex items-center justify-between py-2.5 px-3 bg-slate-50 rounded-2xl text-xs text-slate-700 font-medium">
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
          </div>

          {/* Feature tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md">
              {apartment.petPolicy}
            </span>
            {apartment.inUnitLaundry && (
              <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-800 rounded-md">
                {t('inUnitLaundry')}
              </span>
            )}
            {apartment.parking && (
              <span className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-800 rounded-md">
                {t('parkingSpot')}
              </span>
            )}
          </div>
        </div>

        {/* Landlord mini-badge & Quick Action */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={apartment.landlord.avatar}
              alt={apartment.landlord.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {apartment.landlord.name}
                </span>
                {apartment.landlord.verified && (
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                )}
              </div>
              <span className="text-[10px] text-slate-500 block truncate">
                ★ {apartment.landlord.rating} ({apartment.landlord.reviewsCount})
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(apartment);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 rounded-xl transition-colors shrink-0"
          >
            <span>{t('viewDetails')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
