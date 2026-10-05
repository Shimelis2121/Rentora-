import React, { useState } from 'react';
import {
  FileText,
  X,
  CheckCircle2,
  FileSpreadsheet,
  DollarSign,
  Building,
  UserCheck,
  Shield,
} from 'lucide-react';
import { Apartment, ConnectedSheetInfo, RentalApplication } from '../types';
import { appendApplicationToSheet } from '../services/sheets';
import { useTranslation } from '../i18n/LanguageContext';

interface RentalApplicationModalProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmitted: (app: RentalApplication) => void;
  token: string | null;
  connectedSheet: ConnectedSheetInfo | null;
  autoSyncApplications: boolean;
}

export const RentalApplicationModal: React.FC<RentalApplicationModalProps> = ({
  apartment,
  isOpen,
  onClose,
  onApplicationSubmitted,
  token,
  connectedSheet,
  autoSyncApplications,
}) => {
  const { t } = useTranslation();
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('+251 9');
  const [monthlyIncome, setMonthlyIncome] = useState<number | ''>(85000);
  const [creditTier, setCreditTier] = useState<
    '750+ (Excellent)' | '700-749 (Good)' | '650-699 (Fair)' | 'Under 650'
  >('750+ (Excellent)');
  const [employer, setEmployer] = useState('');
  const [occupation, setOccupation] = useState('');
  const [moveInDate, setMoveInDate] = useState(() => {
    return apartment?.availableDate || new Date().toISOString().split('T')[0];
  });
  const [occupantsCount, setOccupantsCount] = useState(1);
  const [hasPets, setHasPets] = useState(false);
  const [petsDescription, setPetsDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetSyncSuccess, setSheetSyncSuccess] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<RentalApplication | null>(null);

  if (!isOpen || !apartment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !applicantPhone || !monthlyIncome) return;

    setIsSubmitting(true);
    setSheetSyncSuccess(false);

    const newApp: RentalApplication = {
      id: `app-eth-${Date.now().toString().slice(-4)}`,
      apartmentId: apartment.id,
      apartmentTitle: apartment.title,
      applicantName,
      applicantEmail,
      applicantPhone,
      monthlyIncome: Number(monthlyIncome),
      creditScoreRange: creditTier,
      currentEmployer: employer || 'Self-Employed / Business',
      occupation: occupation || 'Professional',
      moveInDate,
      occupantsCount,
      hasPets,
      petsDescription: hasPets ? petsDescription : undefined,
      status: 'Submitted',
      appliedAt: new Date().toLocaleString(),
    };

    if (token && connectedSheet && autoSyncApplications) {
      try {
        await appendApplicationToSheet(token, connectedSheet.spreadsheetId, newApp);
        setSheetSyncSuccess(true);
      } catch (err) {
        console.error('Failed to append application to sheet:', err);
      }
    }

    onApplicationSubmitted(newApp);
    setSubmittedApp(newApp);
    setIsSubmitting(false);
  };

  const handleResetAndClose = () => {
    setSubmittedApp(null);
    setSheetSyncSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t('applyModalTitle')}</h3>
                <p className="text-xs text-slate-300 line-clamp-1">{apartment.title}</p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {submittedApp ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">{t('appSubmittedTitle')}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {t('appSubmittedDesc')}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold text-slate-800">{submittedApp.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Move-In Date:</span>
                  <span className="font-semibold text-slate-800">{submittedApp.moveInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Income:</span>
                  <span className="font-semibold text-slate-800">
                    {submittedApp.monthlyIncome.toLocaleString()} {t('currency')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Under Review
                  </span>
                </div>
              </div>

              {sheetSyncSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('syncedToSheetToast')}</span>
                </div>
              )}

              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Apartment Quick Recap */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Applying for:</span>
                  <span className="font-bold text-slate-900">{apartment.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Rent / Deposit:</span>
                  <span className="font-bold text-emerald-800">
                    {apartment.price.toLocaleString()} / {apartment.deposit.toLocaleString()} {t('currency')}
                  </span>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('applicantDetails')}</span>
                </h4>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t('fullName')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bethlehem Assefa"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="bethlehem@example.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+251 91 123 4567"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Financials & Employment */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('financialQualification')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('monthlyIncome')}
                    </label>
                    <input
                      type="number"
                      required
                      min={5000}
                      step={1000}
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value) || '')}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('creditTier')}
                    </label>
                    <select
                      value={creditTier}
                      onChange={(e) => setCreditTier(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    >
                      <option value="750+ (Excellent)">750+ (Verified High Income)</option>
                      <option value="700-749 (Good)">700-749 (Stable Employment)</option>
                      <option value="650-699 (Fair)">650-699 (Standard)</option>
                      <option value="Under 650">Under 650</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('employer')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ethio Telecom / Commercial Bank"
                      value={employer}
                      onChange={(e) => setEmployer(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('jobTitle')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer / Manager"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lease Preferences */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('moveInDate')} & {t('occupants')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('moveInDate')}
                    </label>
                    <input
                      type="date"
                      required
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t('occupants')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={occupantsCount}
                      onChange={(e) => setOccupantsCount(Number(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={hasPets}
                      onChange={(e) => setHasPets(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                    />
                    <span>{t('hasPetsQuestion')}</span>
                  </label>
                  {hasPets && (
                    <input
                      type="text"
                      placeholder="e.g. 1 small cat / dog"
                      value={petsDescription}
                      onChange={(e) => setPetsDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
                    />
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-emerald-300" />
                      <span>{t('submitAppBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
