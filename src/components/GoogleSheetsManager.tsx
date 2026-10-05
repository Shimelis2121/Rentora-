import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Unlink,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ConfirmationModal } from './ConfirmationModal';
import {
  createRentoraSpreadsheet,
  fetchSpreadsheetInfo,
  importListingsFromSheet,
  syncAllListingsToSheet,
} from '../services/sheets';
import { Apartment, ConnectedSheetInfo } from '../types';
import { User } from 'firebase/auth';
import { useTranslation } from '../i18n/LanguageContext';

interface GoogleSheetsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  token: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  listings: Apartment[];
  onImportListings: (imported: Apartment[]) => void;
  connectedSheet: ConnectedSheetInfo | null;
  setConnectedSheet: (sheet: ConnectedSheetInfo | null) => void;
  autoSyncApplications: boolean;
  setAutoSyncApplications: (val: boolean) => void;
}

export const GoogleSheetsManager: React.FC<GoogleSheetsManagerProps> = ({
  isOpen,
  onClose,
  user,
  token,
  onSignIn,
  onSignOut,
  listings,
  onImportListings,
  connectedSheet,
  setConnectedSheet,
  autoSyncApplications,
  setAutoSyncApplications,
}) => {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [manualSheetInput, setManualSheetInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    confirmLabel: string;
    isDestructive: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
    confirmLabel: 'Confirm',
    isDestructive: true,
  });

  if (!isOpen) return null;

  const handleCreateNewSpreadsheet = async () => {
    if (!token) return;
    setIsCreating(true);
    setStatusMessage(null);
    try {
      const res = await createRentoraSpreadsheet(token, listings);
      const newSheetInfo: ConnectedSheetInfo = {
        spreadsheetId: res.spreadsheetId,
        title: res.title,
        url: res.spreadsheetUrl,
        lastSyncedAt: new Date().toLocaleTimeString(),
      };
      setConnectedSheet(newSheetInfo);
      setStatusMessage({
        type: 'success',
        text: `Created and linked Google Spreadsheet: "${res.title}" with pre-formatted tabs for Listings, Applications, Fee Payments, and Lease Tracker!`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text:
          err.message ||
          'Failed to create Google Spreadsheet. Please verify your permissions.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !manualSheetInput.trim()) return;

    setStatusMessage(null);
    let extractedId = manualSheetInput.trim();
    const match = extractedId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      extractedId = match[1];
    }

    try {
      const info = await fetchSpreadsheetInfo(token, extractedId);
      const sheetInfo: ConnectedSheetInfo = {
        spreadsheetId: extractedId,
        title: info.title,
        url: info.url,
        lastSyncedAt: new Date().toLocaleTimeString(),
      };
      setConnectedSheet(sheetInfo);
      setManualSheetInput('');
      setStatusMessage({
        type: 'success',
        text: `Successfully connected to "${info.title}"! Tabs found: ${info.sheets.join(', ')}`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text:
          err.message ||
          'Unable to access that spreadsheet. Make sure your account has edit permissions.',
      });
    }
  };

  const promptSyncListings = () => {
    if (!token || !connectedSheet) return;
    setConfirmModal({
      isOpen: true,
      title: 'Update Google Sheet Listings?',
      message: `This will update the "Listings" tab in your connected Google Sheet (${connectedSheet.title}) with all ${listings.length} current apartment listings from Rentora.`,
      confirmLabel: 'Update Sheet',
      isDestructive: false,
      action: async () => {
        setIsSyncing(true);
        try {
          await syncAllListingsToSheet(token, connectedSheet.spreadsheetId, listings);
          setConnectedSheet({
            ...connectedSheet,
            lastSyncedAt: new Date().toLocaleTimeString(),
          });
          setStatusMessage({
            type: 'success',
            text: `Successfully synced ${listings.length} listings to "${connectedSheet.title}"!`,
          });
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err.message || 'Failed to sync listings to sheet.',
          });
        } finally {
          setIsSyncing(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const promptImportListings = () => {
    if (!token || !connectedSheet) return;
    setConfirmModal({
      isOpen: true,
      title: 'Import Listings from Google Sheet?',
      message: `This will read apartment rows from the "Listings" tab of "${connectedSheet.title}" and add them into your active Rentora catalog. Do you want to proceed?`,
      confirmLabel: 'Import Listings',
      isDestructive: false,
      action: async () => {
        setIsImporting(true);
        try {
          const imported = await importListingsFromSheet(token, connectedSheet.spreadsheetId);
          onImportListings(imported);
          setStatusMessage({
            type: 'success',
            text: `Successfully imported ${imported.length} new apartment listings from Google Sheets!`,
          });
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err.message || 'Failed to import listings from Google Sheets.',
          });
        } finally {
          setIsImporting(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const promptDisconnectSheet = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Disconnect Google Sheet?',
      message:
        'This will disconnect the spreadsheet from Rentora. The file in your Google Drive will remain completely intact.',
      confirmLabel: 'Disconnect',
      isDestructive: true,
      action: async () => {
        setConnectedSheet(null);
        setStatusMessage({
          type: 'info',
          text: 'Spreadsheet disconnected from Rentora.',
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                  <FileSpreadsheet className="w-7 h-7 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {t('sheetsModalTitle')}
                  </h2>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    {t('sheetsModalDesc')}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Status message */}
            {statusMessage && (
              <div
                className={`p-4 rounded-2xl flex items-start gap-3 border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-50 text-rose-900 border-rose-200'
                    : 'bg-blue-50 text-blue-900 border-blue-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div className="text-sm font-medium flex-1">{statusMessage.text}</div>
                <button
                  onClick={() => setStatusMessage(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Google Account Authentication Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  {user ? (
                    <>
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'Google Account'}
                          className="w-11 h-11 rounded-full border-2 border-emerald-500 object-cover shadow-xs"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-base shadow-xs">
                          {user.displayName?.[0] || user.email?.[0] || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {user.displayName || 'Google Workspace User'}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Connected
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        Connect your Google Workspace
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 max-w-sm">
                        Sign in with Google to create and sync your Ethiopian property spreadsheets in Google Drive.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  {user ? (
                    <button
                      onClick={onSignOut}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <GoogleSignInButton onClick={onSignIn} text="Connect with Google" />
                  )}
                </div>
              </div>
            </div>

            {/* When not signed in */}
            {!user && (
              <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <FileSpreadsheet className="w-10 h-10 text-emerald-700 mx-auto opacity-70" />
                <h4 className="font-bold text-slate-900 text-base">Google Sheets Integration</h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Rentora connects with Google Sheets so landlords can manage inventory in spreadsheets, and tenant lease applications automatically sync to their drive.
                </p>
                <div className="pt-2">
                  <GoogleSignInButton onClick={onSignIn} />
                </div>
              </div>
            )}

            {/* When signed in */}
            {user && (
              <>
                {connectedSheet ? (
                  <div className="border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-800 text-white rounded-md flex items-center gap-1 shadow-2xs">
                            <Database className="w-3 h-3" />
                            {t('activeSheet')}
                          </span>
                          {connectedSheet.lastSyncedAt && (
                            <span className="text-xs text-slate-500">
                              Synced at {connectedSheet.lastSyncedAt}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          {connectedSheet.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">
                          ID: {connectedSheet.spreadsheetId}
                        </p>
                      </div>

                      <a
                        href={connectedSheet.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
                      >
                        <span>{t('openInSheets')}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Pre-formatted Tabs Preview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      <div className="bg-white border border-emerald-100 rounded-xl p-2.5 text-center">
                        <span className="text-xs font-semibold text-slate-700 block">Listings</span>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          {listings.length} rows
                        </span>
                      </div>
                      <div className="bg-white border border-emerald-100 rounded-xl p-2.5 text-center">
                        <span className="text-xs font-semibold text-slate-700 block">
                          Applications
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium">Live sync</span>
                      </div>
                      <div className="bg-white border border-emerald-100 rounded-xl p-2.5 text-center">
                        <span className="text-xs font-semibold text-slate-700 block">
                          Fee Payments
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium">200 ETB logs</span>
                      </div>
                      <div className="bg-white border border-emerald-100 rounded-xl p-2.5 text-center">
                        <span className="text-xs font-semibold text-slate-700 block">
                          Lease Tracker
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">Pre-formatted</span>
                      </div>
                    </div>

                    {/* Actions on active sheet */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-100/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={promptSyncListings}
                          disabled={isSyncing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl shadow-2xs transition-colors disabled:opacity-50"
                        >
                          <Upload
                            className={`w-3.5 h-3.5 text-emerald-700 ${
                              isSyncing ? 'animate-bounce' : ''
                            }`}
                          />
                          <span>{t('pushListingsPrompt')}</span>
                        </button>
                        <button
                          onClick={promptImportListings}
                          disabled={isImporting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl shadow-2xs transition-colors disabled:opacity-50"
                        >
                          <Download
                            className={`w-3.5 h-3.5 text-blue-600 ${
                              isImporting ? 'animate-bounce' : ''
                            }`}
                          />
                          <span>{t('importListingsPrompt')}</span>
                        </button>
                      </div>

                      <button
                        onClick={promptDisconnectSheet}
                        className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline p-1"
                      >
                        <Unlink className="w-3 h-3" />
                        <span>{t('disconnect')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Option 1: Create New Spreadsheet */}
                    <div className="border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 transition-colors bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <PlusCircle className="w-4 h-4 text-emerald-700" />
                            {t('createSheetPrompt')}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                            Generates a structured Google Spreadsheet in your Google Drive with dedicated
                            tabs: <b>Listings</b>, <b>Applications</b>, <b>Fee Payments</b>, and <b>Lease Tracker</b>.
                          </p>
                        </div>
                        <button
                          onClick={handleCreateNewSpreadsheet}
                          disabled={isCreating}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
                        >
                          {isCreating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Create Spreadsheet</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Option 2: Connect Existing */}
                    <div className="border border-slate-200 rounded-2xl p-5 bg-white">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        Or Link an Existing Google Sheet
                      </h4>
                      <p className="text-xs text-slate-600 mb-3">
                        Paste the URL or Spreadsheet ID of any existing sheet you own.
                      </p>
                      <form onSubmit={handleLinkExisting} className="flex gap-2">
                        <input
                          type="text"
                          value={manualSheetInput}
                          onChange={(e) => setManualSheetInput(e.target.value)}
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                        />
                        <button
                          type="submit"
                          disabled={!manualSheetInput.trim()}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                        >
                          Connect
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Real-time Automation Toggle */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Real-time Synchronization Rules
                  </h4>
                  <label className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="pr-4">
                      <span className="text-xs font-semibold text-slate-800 block">
                        {t('autoSyncAppsLabel')}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Whenever an applicant applies for a lease, automatically append details to the "Applications" sheet.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSyncApplications}
                      onChange={(e) => setAutoSyncApplications(e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded-sm focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              Done
            </button>
          </div>
        </div>
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
        isLoading={isSyncing || isImporting}
      />
    </>
  );
};
