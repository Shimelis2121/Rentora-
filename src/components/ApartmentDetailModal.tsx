import React, { useState } from 'react';
import {
  X,
  Heart,
  Calendar,
  FileText,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Check,
  Compass,
  Footprints,
  Train,
  Bike,
  Sparkles,
  Phone,
  Mail,
  Share2,
} from 'lucide-react';
import { Apartment } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ApartmentDetailModalProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onApply: (apartment: Apartment) => void;
  onSendMessage: (apartment: Apartment) => void;
}

export const ApartmentDetailModal: React.FC<ApartmentDetailModalProps> = ({
  apartment,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onApply,
  onSendMessage,
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !apartment) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
              {apartment.propertyType}
            </span>
            {apartment.featured && (
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {t('featured')}
              </span>
            )}
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              ID: {apartment.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative"
              title="Share listing link"
            >
              {copiedLink ? (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Copied
                </span>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => onToggleFavorite(apartment.id)}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite
                  ? 'text-rose-500 bg-rose-50'
                  : 'text-slate-500 hover:text-rose-500 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 space-y-8">
          {/* Gallery View */}
          <div className="space-y-3">
            <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
              <img
                src={apartment.images[selectedImage] || apartment.images[0]}
                alt={apartment.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium">
                Photo {selectedImage + 1} of {apartment.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {apartment.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {apartment.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-emerald-700 scale-102 shadow-xs'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Key Metrics Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {apartment.price.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-emerald-800">
                  {t('currencyPerMonth')}
                </span>
              </div>
              <h1 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {apartment.title}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  {apartment.address}, {apartment.neighborhood}, {apartment.city}
                </span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-2 min-w-[240px]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{t('securityDeposit')}:</span>
                <span className="font-semibold text-slate-800">
                  {apartment.deposit.toLocaleString()} {t('currency')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{t('availableFrom')}:</span>
                <span className="font-semibold text-slate-800">
                  {apartment.availableDate}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{t('leaseTerms')}:</span>
                <span className="font-semibold text-slate-800">{t('months12')}</span>
              </div>
            </div>
          </div>

          {/* Key Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-white text-emerald-800 rounded-xl shadow-2xs">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">{t('bedrooms')}</span>
                <span className="text-base font-bold text-slate-900">
                  {apartment.bedrooms === 0 ? t('studio') : `${apartment.bedrooms} Bed`}
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-white text-emerald-800 rounded-xl shadow-2xs">
                <Bath className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Bathrooms</span>
                <span className="text-base font-bold text-slate-900">{apartment.bathrooms} Bath</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-white text-emerald-800 rounded-xl shadow-2xs">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Area</span>
                <span className="text-base font-bold text-slate-900">{apartment.sqft} m²</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-white text-emerald-800 rounded-xl shadow-2xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Policy</span>
                <span className="text-xs font-bold text-slate-900 truncate block">
                  {apartment.petPolicy}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">{t('aboutResidence')}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{apartment.description}</p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{t('amenitiesTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {apartment.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>{amenity}</span>
                </div>
              ))}
              {apartment.inUnitLaundry && (
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-sm font-semibold text-emerald-900">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{t('inUnitLaundry')}</span>
                </div>
              )}
              {apartment.parking && (
                <div className="flex items-center gap-2.5 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-sm font-semibold text-blue-900">
                  <Check className="w-4 h-4 text-blue-700" />
                  <span>{t('parkingSpot')}</span>
                </div>
              )}
              {apartment.balcony && (
                <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{t('balconyTerrace')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Neighborhood & Walk Score */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">{t('mobilityTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">{apartment.walkScore}</span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 block">
                    {t('walkScore')}
                  </span>
                  <span className="text-[11px] text-emerald-800 font-bold">Excellent</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">{apartment.transitScore}</span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 block">
                    {t('transitScore')}
                  </span>
                  <span className="text-[11px] text-blue-800 font-bold">Taxi & Transit</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">{apartment.bikeScore}</span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 block">Accessibility</span>
                  <span className="text-[11px] text-amber-800 font-bold">Paved Roads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Landlord Profile Card */}
          <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={apartment.landlord.avatar}
                  alt={apartment.landlord.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{apartment.landlord.name}</h3>
                    {apartment.landlord.verified && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full flex items-center gap-1 border border-emerald-500/30">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        {t('verifiedLandlord')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-300">
                    <span>★ {apartment.landlord.rating} ({apartment.landlord.reviewsCount} reviews)</span>
                    <span>•</span>
                    <span>{t('respondsIn')} {apartment.landlord.responseTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSendMessage(apartment)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{t('messageLandlord')}</span>
                </button>
                <a
                  href={`tel:${apartment.landlord.phone}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('callLandlord')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom CTA Dock */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 block">{t('totalMonthlyRent')}</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {apartment.price.toLocaleString()} {t('currency')}/mo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSendMessage(apartment)}
              className="px-5 py-2.5 text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-all shadow-2xs flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>{t('messageLandlord')}</span>
            </button>

            <button
              onClick={() => onApply(apartment)}
              className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-2xl transition-all shadow-md flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t('applyLease')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
