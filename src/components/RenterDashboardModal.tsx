import React, { useState } from 'react';
import {
  Heart,
  FileText,
  X,
  CheckCircle2,
  Trash2,
  MapPin,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Apartment, RentalApplication } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface RenterDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Apartment[];
  onRemoveFavorite: (id: string) => void;
  onSelectApartment: (apt: Apartment) => void;
  applications: RentalApplication[];
}

export const RenterDashboardModal: React.FC<RenterDashboardModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectApartment,
  applications,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'favorites' | 'applications'>('favorites');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('myActivity')}</h2>
            <p className="text-xs text-slate-500">
              Track your saved Ethiopian homes and submitted rental lease applications
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Saved Homes & Applications */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/70">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'favorites'
                ? 'border-emerald-800 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Residences</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800">
              {favorites.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'applications'
                ? 'border-emerald-800 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('appsTab')}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800">
              {applications.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6 space-y-4">
          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-3">
              {favorites.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Heart className="w-10 h-10 mx-auto opacity-50 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No saved homes</p>
                  <p className="text-xs text-slate-400">
                    Click the heart icon on any listing to save it to your wishlist.
                  </p>
                </div>
              ) : (
                favorites.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3 bg-white"
                  >
                    <div
                      onClick={() => {
                        onClose();
                        onSelectApartment(apt);
                      }}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <img
                        src={apt.images[0]}
                        alt={apt.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="font-bold text-sm text-slate-900 block truncate">
                          {apt.title}
                        </span>
                        <span className="text-xs text-emerald-800 font-bold block">
                          {apt.price.toLocaleString()} {t('currency')}/mo •{' '}
                          {apt.bedrooms === 0 ? t('studio') : `${apt.bedrooms} Bed`}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {apt.neighborhood}, {apt.city}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectApartment(apt);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-900 transition-colors"
                      >
                        {t('viewDetails')}
                      </button>
                      <button
                        onClick={() => onRemoveFavorite(apt.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-3">
              {applications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto opacity-50 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No submitted applications</p>
                  <p className="text-xs text-slate-400">
                    Submit rental applications directly to Ethiopian landlords without middleman fees.
                  </p>
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{app.apartmentTitle}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'Under Review' || app.status === 'Submitted'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Applicant: <b>{app.applicantName}</b> • Move-in: <b>{app.moveInDate}</b>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Monthly Income: {app.monthlyIncome.toLocaleString()} {t('currency')} •
                        Applied on {app.appliedAt}
                      </p>
                    </div>

                    <div className="text-right">
                      {app.status === 'Approved' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Lease Approved</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Awaiting Landlord Review</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
