import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  FileText,
  PlusCircle,
  FileSpreadsheet,
  ExternalLink,
  Upload,
  CheckCircle2,
  Trash2,
  Eye,
  UserCheck,
  CreditCard,
  Receipt,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';
import { Apartment, ConnectedSheetInfo, RentalApplication, ListingPayment } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { syncAllListingsToSheet } from '../services/sheets';
import { useTranslation } from '../i18n/LanguageContext';

interface LandlordViewProps {
  listings: Apartment[];
  applications: RentalApplication[];
  payments: ListingPayment[];
  onOpenAddModal: () => void;
  onOpenSheetsModal: () => void;
  onDeleteListing: (id: string) => void;
  onUpdateListingStatus: (id: string, status: Apartment['status']) => void;
  onUpdateAppStatus: (id: string, status: RentalApplication['status']) => void;
  onSelectApartment: (apt: Apartment) => void;
  connectedSheet: ConnectedSheetInfo | null;
  token: string | null;
}

export const LandlordView: React.FC<LandlordViewProps> = ({
  listings,
  applications,
  payments,
  onOpenAddModal,
  onOpenSheetsModal,
  onDeleteListing,
  onUpdateListingStatus,
  onUpdateAppStatus,
  onSelectApartment,
  connectedSheet,
  token,
}) => {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'listings' | 'applications' | 'payments'>('listings');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<ListingPayment | null>(null);

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    confirmLabel: string;
    isDestructive: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    confirmLabel: 'Confirm',
    isDestructive: true,
  });

  const totalMonthlyPotential = listings.reduce((sum, apt) => sum + apt.price, 0);
  const pendingAppsCount = applications.filter(
    (a) => a.status === 'Submitted' || a.status === 'Under Review'
  ).length;

  // Freemium Calculations (Max 2 free listings, 3rd+ requires 200 ETB)
  const freeListingCount = Math.min(listings.length, 2);
  const isFreeQuotaExhausted = listings.length >= 2;
  const paidListingsCount = listings.filter((apt) => apt.isPaidListing).length;

  const promptDeleteListing = (apt: Apartment) => {
    setConfirmModal({
      isOpen: true,
      title: `${t('deleteListing')} "${apt.title}"?`,
      message: `Are you sure you want to permanently remove this Ethiopian listing from Rentora?`,
      confirmLabel: t('deleteListing'),
      isDestructive: true,
      action: () => {
        onDeleteListing(apt.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const promptSyncToSheet = () => {
    if (!token || !connectedSheet) {
      onOpenSheetsModal();
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Update Google Sheet Listings?',
      message: `This will update the "Listings" tab in "${connectedSheet.title}" with the latest ${listings.length} Ethiopian properties and their monetization statuses.`,
      confirmLabel: 'Push to Google Sheet',
      isDestructive: false,
      action: async () => {
        setIsSyncing(true);
        try {
          await syncAllListingsToSheet(token, connectedSheet.spreadsheetId, listings);
          setSyncSuccessMsg('Listings successfully synced to your Google Sheet!');
          setTimeout(() => setSyncSuccessMsg(''), 4000);
        } catch (err: any) {
          alert('Sync failed: ' + err.message);
        } finally {
          setIsSyncing(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Google Sheets Status */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-800/50">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">
                Google Sheets Synchronization (ኢትዮጵያ)
              </span>
              {connectedSheet ? (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40">
                  Live Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 text-white rounded-full">
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              {connectedSheet
                ? `Active Sheet: "${connectedSheet.title}". Auto-syncing listings, fee payments, and tenant applications.`
                : 'Connect your Google account to automatically store listings and applications in Google Sheets.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {connectedSheet && (
            <>
              <a
                href={connectedSheet.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition-colors flex items-center gap-1.5"
              >
                <span>{t('openInSheets')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={promptSyncToSheet}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Syncing...' : t('pushListingsBtn')}</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenSheetsModal}
            className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {connectedSheet ? 'Manage Sheets' : 'Connect Google Sheets'}
          </button>
        </div>
      </div>

      {/* Freemium Policy Alert Bar */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all ${
          isFreeQuotaExhausted
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              isFreeQuotaExhausted
                ? 'bg-amber-500/20 text-amber-800 border border-amber-400/40'
                : 'bg-emerald-500/20 text-emerald-800 border border-emerald-400/40'
            }`}
          >
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">
                {language === 'am'
                  ? 'የአከራዮች ፍሪሚየም የቤት ዝርዝር ፖሊሲ (Freemium Listing Model)'
                  : language === 'om'
                  ? 'Sirna Kaffaltii Manneen Maxxansuu (Freemium Model)'
                  : 'Landlord Freemium Model: Max 2 Free Properties'}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  isFreeQuotaExhausted
                    ? 'bg-amber-200 text-amber-900 border-amber-300'
                    : 'bg-emerald-200 text-emerald-900 border-emerald-300'
                }`}
              >
                {isFreeQuotaExhausted ? 'Quota Full (2/2 Used)' : `${freeListingCount}/2 Free Used`}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {language === 'am'
                ? isFreeQuotaExhausted
                  ? `የነጻ 2 ቤቶች ኮታዎ አልቋል (አሁን ${listings.length} ቤቶች አሉዎት)። 3ኛ እና ከዚያ በላይ ቤቶችን ለመልቀቅ በአንድ ቤት 200 የኢትዮጵያ ብር በቴሌብር ወይም በሲቢኢ ብር ይከፈላል።`
                  : `እስከ 2 ቤቶች ድረስ በነጻ መመዝገብ ይችላሉ። 3ኛ ቤት እና ተጨማሪ ቤቶች በአንድ ቤት 200 ብር ብቻ ይከፈላል።`
                : isFreeQuotaExhausted
                ? `You have published ${listings.length} properties. Your 2 free listing quota is used. To list any additional property, a 200 ETB listing fee via Telebirr or CBE Birr applies.`
                : `You are currently using ${freeListingCount} of your 2 free property listings. You have ${2 - freeListingCount} free listing slot remaining.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {isFreeQuotaExhausted
                ? language === 'am'
                  ? 'ተጨማሪ ቤት ልቀቁ (200 ብር)'
                  : 'Post Property (200 ETB)'
                : t('addListingBtn')}
            </span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Direct Renter-Landlord Communication Highlight Banner */}
      <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-200">
            <b>{language === 'am' ? 'ቀጥተኛ ግንኙነት፦' : 'Direct Communication:'}</b>{' '}
            {language === 'am'
              ? 'ተከራዮች በቀጥታ በስልክ፣ በቴሌግራም፣ በዋትስአፕ ወይም በመተግበሪያው መልእክት ይደውሉልዎታል። ምንም ደላላ ወይም የቀጠሮ ቢሮክራሲ የለም።'
              : 'Renters contact landlords directly via phone, WhatsApp, Telegram, or in-app messages. No middleman broker fees or viewing appointment bureaucracy.'}
          </span>
        </div>
        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md shrink-0 border border-emerald-500/30">
          0% Delala / Broker Fee
        </span>
      </div>

      {/* KPI Cards (ETB) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Properties */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              {t('kpiProperties')}
            </span>
            <span className="text-2xl font-black text-slate-900">{listings.length}</span>
          </div>
        </div>

        {/* Projected Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              {t('kpiRevenue')}
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalMonthlyPotential.toLocaleString()} {t('currency')}
            </span>
          </div>
        </div>

        {/* Freemium & Paid Listings Tier */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Listing Quota
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">
                {listings.length <= 2 ? `${listings.length}/2` : `${paidListingsCount} Paid`}
              </span>
              <span className="text-[10px] font-bold text-amber-700">
                {listings.length <= 2 ? 'Free Tier' : '200 ETB/add.'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Applications */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-800 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              {t('kpiApps')}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{applications.length}</span>
              {pendingAppsCount > 0 && (
                <span className="text-[11px] font-bold text-purple-600">({pendingAppsCount})</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Landlord Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Navigation & Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'listings'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('listingsTab')} ({listings.length})
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'applications'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('appsTab')} ({applications.length})
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'payments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {language === 'am'
                  ? 'የክፍያ ደረሰኞች'
                  : language === 'om'
                  ? 'Nagahee Kaffaltii'
                  : 'Listing Payments & Receipts'}{' '}
                ({payments.length})
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addListingBtn')}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Listings Table */}
        {activeTab === 'listings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">{t('propertyCol')}</th>
                  <th className="py-3.5 px-4">{t('typeLayoutCol')}</th>
                  <th className="py-3.5 px-4">{t('rentDepositCol')}</th>
                  <th className="py-3.5 px-4">Tier / Monetization</th>
                  <th className="py-3.5 px-4">{t('statusCol')}</th>
                  <th className="py-3.5 px-4 text-right">{t('actionsCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((apt, index) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={apt.images[0]}
                          alt={apt.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <span className="font-bold text-slate-900 block truncate max-w-[200px] sm:max-w-xs">
                            {apt.title}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {apt.address}, {apt.city}
                          </span>
                          <span className="text-[10px] text-emerald-800 font-mono block">
                            📍 {apt.coordinates.lat.toFixed(3)}, {apt.coordinates.lng.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {apt.bedrooms === 0 ? t('studio') : `${apt.bedrooms} Bed`} • {apt.bathrooms} Bath
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {apt.sqft} m² • {apt.propertyType}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">
                        {apt.price.toLocaleString()} {t('currency')}/mo
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {t('depositLabel')}: {apt.deposit.toLocaleString()} {t('currency')}
                      </span>
                    </td>

                    {/* Listing Tier: Free vs 200 ETB Paid */}
                    <td className="py-4 px-4">
                      {apt.isPaidListing ? (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-md inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            Paid (200 ETB)
                          </span>
                          {apt.paymentRef && (
                            <span className="text-[10px] text-slate-500 font-mono block">
                              Ref: {apt.paymentRef}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md inline-block">
                          ✓ Free Tier ({index < 2 ? `Slot #${index + 1}` : 'Granted'})
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={apt.status}
                        onChange={(e) =>
                          onUpdateListingStatus(apt.id, e.target.value as Apartment['status'])
                        }
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors ${
                          apt.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : apt.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Available">Available</option>
                        <option value="Pending">Pending</option>
                        <option value="Rented">Rented</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectApartment(apt)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Preview listing"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => promptDeleteListing(apt)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Applications Manager */}
        {activeTab === 'applications' && (
          <div className="p-6 space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <FileText className="w-10 h-10 mx-auto opacity-50 mb-2" />
                <p className="font-semibold text-sm">No applications submitted yet</p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{app.apartmentTitle}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'Declined'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      Applicant: <b>{app.applicantName}</b> • Email: {app.applicantEmail} • Phone:{' '}
                      {app.applicantPhone}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">{t('monthlyIncome')}</span>
                        <span className="font-bold text-slate-900">
                          {app.monthlyIncome.toLocaleString()} {t('currency')}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">{t('creditTier')}</span>
                        <span className="font-bold text-emerald-800">{app.creditScoreRange}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">{t('employer')}</span>
                        <span className="font-bold text-slate-900 truncate block">
                          {app.currentEmployer}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">{t('moveInDate')}</span>
                        <span className="font-bold text-slate-900">{app.moveInDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {app.status !== 'Approved' && (
                      <button
                        onClick={() => onUpdateAppStatus(app.id, 'Approved')}
                        className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{t('approveLease')}</span>
                      </button>
                    )}
                    {app.status !== 'Declined' && (
                      <button
                        onClick={() => onUpdateAppStatus(app.id, 'Declined')}
                        className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        {t('decline')}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Listing Payments & Receipts (200 ETB fee) */}
        {activeTab === 'payments' && (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  Listing Fee Transactions (200 ETB per property)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Official verified payments via Ethiopian payment gateways (Telebirr & CBE Birr)
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl self-start sm:self-center">
                Total Fees: {payments.length * 200} ETB
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Receipt className="w-10 h-10 mx-auto opacity-50 mb-2" />
                <p className="font-semibold text-sm">No listing fee payments yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  When you list your 3rd and subsequent properties, your 200 ETB Telebirr or CBE Birr receipts will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs text-white shrink-0 ${
                          pay.paymentMethod === 'telebirr' ? 'bg-emerald-700' : 'bg-purple-800'
                        }`}
                      >
                        {pay.paymentMethod === 'telebirr' ? 'tb' : 'CBE'}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{pay.propertyTitle}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {pay.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Ref: <b>{pay.transactionRef}</b> • Gateway:{' '}
                          <span className="uppercase font-bold text-slate-700">
                            {pay.paymentMethod === 'telebirr' ? 'Telebirr (Ethio Telecom)' : 'CBE Birr'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Paid by {pay.landlordName} ({pay.landlordPhone}) on {pay.paidAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-800 block">
                          {pay.amountEtb} ETB
                        </span>
                        <span className="text-[10px] text-slate-400">Listing Fee</span>
                      </div>

                      <button
                        onClick={() => setSelectedReceipt(pay)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isLoading={isSyncing}
      />

      {/* View Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">Official Listing Fee Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-sans font-bold">Rentora Ethiopia</span>
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  200 ETB PAID
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Property:</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[180px]">
                  {selectedReceipt.propertyTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tx Reference:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-bold text-slate-900 uppercase">
                  {selectedReceipt.paymentMethod === 'telebirr' ? 'telebirr' : 'CBE Birr'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-800">{selectedReceipt.landlordPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-800">{selectedReceipt.paidAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-700 font-bold">VERIFIED COMPLETE</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
