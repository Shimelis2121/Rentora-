import React from 'react';
import {
  KeyRound,
  FileSpreadsheet,
  Calendar,
  Layers,
  LogOut,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { ConnectedSheetInfo } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageToggle } from './LanguageToggle';

interface NavbarProps {
  currentRole: 'renter' | 'landlord';
  onRoleChange: (role: 'renter' | 'landlord') => void;
  user: User | null;
  onOpenSheetsModal: () => void;
  connectedSheet: ConnectedSheetInfo | null;
  favoritesCount: number;
  compareCount: number;
  onOpenCompare: () => void;
  onOpenRenterActivity: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenPricing?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  user,
  onOpenSheetsModal,
  connectedSheet,
  favoritesCount,
  compareCount,
  onOpenCompare,
  onOpenRenterActivity,
  onSignIn,
  onSignOut,
  onOpenPricing,
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => onRoleChange('renter')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
              <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {t('appName')}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] font-semibold text-slate-500 hidden sm:block tracking-wide">
                {t('appTagline')}
              </p>
            </div>
          </div>

          {/* Role Navigation Switcher (Renter vs Landlord) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => onRoleChange('renter')}
              className={`px-2.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentRole === 'renter'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('browseHomes')}
            </button>
            <button
              onClick={() => onRoleChange('landlord')}
              className={`px-2.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentRole === 'landlord'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('landlordPortal')}
            </button>
          </div>

          {/* Right Action Icons & Localization */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Pro Plans Shortcut Button */}
            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-900 border border-emerald-300/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="View Subscription & Pro Plans"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Pro Plans</span>
              </button>
            )}

            {/* Multi-language Selector */}
            <LanguageToggle />

            {/* Google Sheets Status Button */}
            <button
              onClick={onOpenSheetsModal}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                connectedSheet
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Google Sheets Synchronization"
            >
              <FileSpreadsheet
                className={`w-4 h-4 ${connectedSheet ? 'text-emerald-600' : 'text-slate-500'}`}
              />
              <span className="hidden md:inline">
                {connectedSheet ? t('sheetsSynced') : t('googleSheets')}
              </span>
              {connectedSheet && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Compare Bar Trigger */}
            {compareCount > 0 && (
              <button
                onClick={onOpenCompare}
                className="px-2.5 sm:px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{t('compare')}</span>
                <span>({compareCount})</span>
              </button>
            )}

            {/* Renter Activity Hub */}
            <button
              onClick={onOpenRenterActivity}
              className="p-2 sm:px-3 sm:py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs relative"
              title={t('myActivity')}
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">{t('myActivity')}</span>
              {favoritesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1 sm:static sm:w-auto sm:h-auto sm:px-1.5 sm:py-0.2 sm:text-[10px] sm:bg-rose-100 sm:text-rose-700 sm:font-bold">
                  <span className="sm:hidden" />
                  <span className="hidden sm:inline">{favoritesCount}</span>
                </span>
              )}
            </button>

            {/* Google Profile / Sign-In Button */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google Profile'}
                    onClick={onOpenSheetsModal}
                    className="w-8 h-8 rounded-full border-2 border-emerald-500 object-cover cursor-pointer hover:ring-2 hover:ring-emerald-400 transition-all"
                    title={user.email || ''}
                  />
                ) : (
                  <button
                    onClick={onOpenSheetsModal}
                    className="w-8 h-8 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                    title={user.email || ''}
                  >
                    {user.displayName?.[0] || 'U'}
                  </button>
                )}
                <button
                  onClick={onSignOut}
                  title={t('signOut')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all shadow-2xs"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('signIn')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
