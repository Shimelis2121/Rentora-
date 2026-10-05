/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  INITIAL_APARTMENTS,
  INITIAL_APPLICATIONS,
  INITIAL_PAYMENTS,
} from './data/sampleListings';
import {
  Apartment,
  ConnectedSheetInfo,
  FilterState,
  RentalApplication,
  ListingPayment,
} from './types';
import { googleSignIn, initAuth, logout } from './services/auth';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { ApartmentCard } from './components/ApartmentCard';
import { ApartmentListItem } from './components/ApartmentListItem';
import { EthiopiaMapExplorer } from './components/EthiopiaMapExplorer';
import { ApartmentDetailModal } from './components/ApartmentDetailModal';
import { RentalApplicationModal } from './components/RentalApplicationModal';
import { MessageLandlordModal } from './components/MessageLandlordModal';
import { CompareModal } from './components/CompareModal';
import { GoogleSheetsManager } from './components/GoogleSheetsManager';
import { AddListingModal } from './components/AddListingModal';
import { RenterDashboardModal } from './components/RenterDashboardModal';
import { LandlordView } from './components/LandlordView';
import { SubscriptionPricingSection } from './components/SubscriptionPricingSection';
import { SubscriptionPaymentModal } from './components/SubscriptionPaymentModal';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { calculateDistanceKm } from './data/ethiopianLocations';
import { appendFeePaymentToSheet } from './services/sheets';
import {
  FileSpreadsheet,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Search,
  PlusCircle,
  Layers,
  MessageSquare,
} from 'lucide-react';

function RentoraMain() {
  const { t, language } = useTranslation();

  // App Data State
  const [apartments, setApartments] = useState<Apartment[]>(INITIAL_APARTMENTS);
  const [applications, setApplications] = useState<RentalApplication[]>(INITIAL_APPLICATIONS);
  const [payments, setPayments] = useState<ListingPayment[]>(INITIAL_PAYMENTS);
  const [favorites, setFavorites] = useState<string[]>(['apt-eth-01']);
  const [compareList, setCompareList] = useState<Apartment[]>([]);
  const [hasPaidPro, setHasPaidPro] = useState(false);

  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<'renter' | 'landlord'>('renter');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');

  // Auth & Google Sheets State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [connectedSheet, setConnectedSheet] = useState<ConnectedSheetInfo | null>(null);
  const [autoSyncApplications, setAutoSyncApplications] = useState(true);

  // Modals
  const [selectedApartmentForDetail, setSelectedApartmentForDetail] = useState<Apartment | null>(null);
  const [selectedApartmentForApply, setSelectedApartmentForApply] = useState<Apartment | null>(null);
  const [selectedApartmentForMessage, setSelectedApartmentForMessage] = useState<Apartment | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [isRenterActivityModalOpen, setIsRenterActivityModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filters State with Ethiopian location hierarchy & GPS
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    neighborhood: 'All',
    regionId: 'all',
    zoneId: 'all',
    woredaId: 'all',
    minPrice: 0,
    maxPrice: 150000,
    bedrooms: 'all',
    propertyType: 'all',
    petFriendlyOnly: false,
    inUnitLaundryOnly: false,
    parkingOnly: false,
    balconyOnly: false,
    centralACOnly: false,
    furnishedOnly: false,
    generatorOnly: false,
    waterTankOnly: false,
    securityGuardOnly: false,
    elevatorOnly: false,
    sortBy: 'recommended',
    userLocation: null,
  });

  // Initialize Auth Listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        showToast(`Connected as ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    showToast('Signed out of Google account');
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from saved homes');
        return prev.filter((item) => item !== id);
      } else {
        showToast('Saved to your wishlist');
        return [...prev, id];
      }
    });
  };

  // Toggle Compare
  const handleToggleCompare = (apt: Apartment) => {
    setCompareList((prev) => {
      const exists = prev.some((a) => a.id === apt.id);
      if (exists) {
        return prev.filter((a) => a.id !== apt.id);
      } else {
        if (prev.length >= 3) {
          showToast('You can compare a maximum of 3 apartments at a time.');
          return prev;
        }
        showToast(`Added "${apt.title}" to compare list`);
        return [...prev, apt];
      }
    });
  };

  const handleRemoveFromCompare = (id: string) => {
    setCompareList((prev) => prev.filter((a) => a.id !== id));
  };

  // Filtered & Sorted Apartments
  const filteredApartments = useMemo(() => {
    // 1. Calculate dynamic distance if user GPS is available
    const withDistance = apartments.map((apt) => {
      if (filters.userLocation) {
        const dist = calculateDistanceKm(
          filters.userLocation.lat,
          filters.userLocation.lng,
          apt.coordinates.lat,
          apt.coordinates.lng
        );
        return { ...apt, distanceKm: dist };
      }
      return apt;
    });

    return withDistance
      .filter((apt) => {
        // Radius Search / Near Me Filter (e.g. 2km, 5km, 10km, etc.)
        if (filters.selectedRadiusKm && (filters.userLocation || filters.radiusCenter)) {
          if (apt.distanceKm !== undefined && apt.distanceKm > filters.selectedRadiusKm) {
            return false;
          }
        }

        // Search query
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const match =
            apt.title.toLowerCase().includes(q) ||
            apt.neighborhood.toLowerCase().includes(q) ||
            apt.city.toLowerCase().includes(q) ||
            apt.address.toLowerCase().includes(q) ||
            apt.description.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Hierarchical Location: Region -> Zone -> Woreda
        if (filters.regionId !== 'all') {
          if (apt.regionId && apt.regionId !== filters.regionId) return false;
        }
        if (filters.zoneId !== 'all') {
          if (apt.zoneId && apt.zoneId !== filters.zoneId) return false;
        }
        if (filters.woredaId !== 'all') {
          if (apt.woredaId && apt.woredaId !== filters.woredaId) return false;
        }

        // Price in ETB
        if (apt.price > filters.maxPrice) return false;

        // Bedrooms
        if (filters.bedrooms !== 'all') {
          if (filters.bedrooms === '0' && apt.bedrooms !== 0) return false;
          if (filters.bedrooms === '1' && apt.bedrooms !== 1) return false;
          if (filters.bedrooms === '2' && apt.bedrooms !== 2) return false;
          if (filters.bedrooms === '3+' && apt.bedrooms < 3) return false;
        }

        // Property Type
        if (filters.propertyType !== 'all') {
          if (apt.propertyType !== filters.propertyType) return false;
        }

        // Amenities
        if (filters.petFriendlyOnly && apt.petPolicy === 'No Pets') return false;
        if (filters.inUnitLaundryOnly && !apt.inUnitLaundry) return false;
        if (filters.parkingOnly && !apt.parking) return false;
        if (filters.balconyOnly && !apt.balcony) return false;
        if (filters.generatorOnly) {
          const hasGen = apt.amenities.some((a) =>
            a.toLowerCase().includes('generator') || a.toLowerCase().includes('ጀነሬተር')
          );
          if (!hasGen) return false;
        }
        if (filters.waterTankOnly) {
          const hasTank = apt.amenities.some((a) =>
            a.toLowerCase().includes('water') || a.toLowerCase().includes('rotto') || a.toLowerCase().includes('ታንከር')
          );
          if (!hasTank) return false;
        }
        if (filters.securityGuardOnly) {
          const hasGuard = apt.amenities.some((a) =>
            a.toLowerCase().includes('guard') || a.toLowerCase().includes('security') || a.toLowerCase().includes('ጥበቃ')
          );
          if (!hasGuard) return false;
        }
        if (filters.elevatorOnly) {
          const hasElevator = apt.amenities.some((a) =>
            a.toLowerCase().includes('elevator') || a.toLowerCase().includes('lift') || a.toLowerCase().includes('ሊፍት')
          );
          if (!hasElevator) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'distance') {
          return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
        }
        if (filters.sortBy === 'recommended') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        }
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'sqft-desc') return b.sqft - a.sqft;
        if (filters.sortBy === 'walkscore-desc') return b.walkScore - a.walkScore;
        return 0;
      });
  }, [apartments, filters]);

  // Landlord Actions (with Freemium Monetization)
  const handleAddListing = (newApt: Apartment, payment?: ListingPayment) => {
    setApartments((prev) => [newApt, ...prev]);

    if (payment) {
      setPayments((prev) => [payment, ...prev]);
      if (token && connectedSheet) {
        appendFeePaymentToSheet(token, connectedSheet.spreadsheetId, payment).catch(console.error);
      }
      showToast(
        `Property "${newApt.title}" published! (200 ETB verified via ${
          payment.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'
        })`
      );
    } else {
      showToast(`Property "${newApt.title}" published under Free Tier!`);
    }
  };

  const handleDeleteListing = (id: string) => {
    setApartments((prev) => prev.filter((a) => a.id !== id));
    showToast('Listing removed from marketplace');
  };

  const handleUpdateListingStatus = (id: string, status: Apartment['status']) => {
    setApartments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    showToast(`Status updated to "${status}"`);
  };

  const handleUpdateAppStatus = (id: string, status: RentalApplication['status']) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    showToast(`Application marked as "${status}"`);
  };

  const handleImportListings = (imported: Apartment[]) => {
    setApartments((prev) => [...imported, ...prev]);
    showToast(`Imported ${imported.length} apartments from Google Sheet!`);
  };

  const favoriteApartments = useMemo(() => {
    return apartments.filter((a) => favorites.includes(a.id));
  }, [apartments, favorites]);

  const scrollToSearch = () => {
    if (currentRole !== 'renter') {
      setCurrentRole('renter');
    }
    setTimeout(() => {
      const el = document.getElementById('search-filter-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        user={user}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        connectedSheet={connectedSheet}
        favoritesCount={favorites.length}
        compareCount={compareList.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenRenterActivity={() => setIsRenterActivityModalOpen(true)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenPricing={() => {
          const el = document.getElementById('pricing-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            setIsSubscriptionModalOpen(true);
          }
        }}
      />

      {/* Hero Header with strictly updated text and 2 distinct side-by-side CTA buttons */}
      {currentRole === 'renter' && (
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('heroBadge')}</span>
              </div>

              {/* Requirement 1: Main hero text strictly updated */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                Mana jireenyaa keessan Itoophiyaa keessatti Kallattiin Barbaaddadhaa
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {t('heroSubtitle')}
              </p>

              {/* Requirement 2: Two visually distinct, separate buttons side-by-side */}
              <div className="pt-3 flex flex-wrap items-center gap-4">
                {/* Button 1: Mana Barbaadi (Search Property) */}
                <button
                  onClick={scrollToSearch}
                  className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2.5 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Search className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                  <span>Mana Barbaadi</span>
                </button>

                {/* Button 2: Mana Maxxansi (Post Property) */}
                <button
                  onClick={() => setIsAddListingModalOpen(true)}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/25 backdrop-blur-md transition-all flex items-center gap-2.5 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-5 h-5 text-emerald-300" />
                  <span>Mana Maxxansi</span>
                </button>
              </div>
            </div>

            {/* Quick Feature Badges */}
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-emerald-100/90">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {t('noBrokerFees')}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('directContact')}</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                {t('sheetsSyncBadge')}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {currentRole === 'renter' ? (
          <>
            {/* Filter and Search Bar with Ethiopian Location Hierarchy */}
            <div id="search-filter-section" className="scroll-mt-24">
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={() =>
                  setFilters({
                    searchQuery: '',
                    neighborhood: 'All',
                    regionId: 'all',
                    zoneId: 'all',
                    woredaId: 'all',
                    minPrice: 0,
                    maxPrice: 150000,
                    bedrooms: 'all',
                    propertyType: 'all',
                    petFriendlyOnly: false,
                    inUnitLaundryOnly: false,
                    parkingOnly: false,
                    balconyOnly: false,
                    centralACOnly: false,
                    furnishedOnly: false,
                    generatorOnly: false,
                    waterTankOnly: false,
                    securityGuardOnly: false,
                    elevatorOnly: false,
                    sortBy: 'recommended',
                    userLocation: null,
                  })
                }
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                totalResults={filteredApartments.length}
              />
            </div>

            {/* View Mode 1: Leaflet Interactive Ethiopia Map & Pin Dropper */}
            {viewMode === 'map' && (
              <EthiopiaMapExplorer
                apartments={filteredApartments}
                onSelectApartment={setSelectedApartmentForDetail}
                userCoords={filters.userLocation}
                selectedRadiusKm={filters.selectedRadiusKm}
                onSelectRadius={(radiusKm) =>
                  setFilters((prev) => ({ ...prev, selectedRadiusKm: radiusKm }))
                }
                onGpsLocate={(coords) =>
                  setFilters((prev) => ({
                    ...prev,
                    userLocation: coords,
                    sortBy: coords ? 'distance' : prev.sortBy,
                  }))
                }
              />
            )}

            {/* View Mode 2: Grid View */}
            {viewMode === 'grid' && (
              <>
                {filteredApartments.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                    <Search className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="font-bold text-lg text-slate-800">
                      No matching Ethiopian residences found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Try expanding your administrative region or sub-city selection, increasing your ETB budget, or resetting filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApartments.map((apt) => (
                      <ApartmentCard
                        key={apt.id}
                        apartment={apt}
                        isFavorite={favorites.includes(apt.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelect={setSelectedApartmentForDetail}
                        isSelectedForCompare={compareList.some((c) => c.id === apt.id)}
                        onToggleCompare={handleToggleCompare}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* View Mode 3: List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredApartments.map((apt) => (
                  <ApartmentListItem
                    key={apt.id}
                    apartment={apt}
                    isFavorite={favorites.includes(apt.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={setSelectedApartmentForDetail}
                    isSelectedForCompare={compareList.some((c) => c.id === apt.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Landlord Management Portal with Freemium & Payments */
          <LandlordView
            listings={apartments}
            applications={applications}
            payments={payments}
            onOpenAddModal={() => setIsAddListingModalOpen(true)}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onDeleteListing={handleDeleteListing}
            onUpdateListingStatus={handleUpdateListingStatus}
            onUpdateAppStatus={handleUpdateAppStatus}
            onSelectApartment={setSelectedApartmentForDetail}
            connectedSheet={connectedSheet}
            token={token}
          />
        )}

        {/* Requirement 3: Dedicated Subscription / Pro Plan UI */}
        <SubscriptionPricingSection
          onSelectFree={scrollToSearch}
          onSelectPro={() => setIsSubscriptionModalOpen(true)}
          currentPropertyCount={apartments.length}
          hasPaidPro={hasPaidPro}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-16 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm">Rentora Ethiopia</span>
              <p className="text-[11px] text-slate-400">
                Afaan Oromoo • አማርኛ • English | Ethiopian Rental Marketplace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentRole('renter')}
              className="hover:text-slate-900 transition-colors"
            >
              {t('browseHomes')}
            </button>
            <button
              onClick={() => setCurrentRole('landlord')}
              className="hover:text-slate-900 transition-colors"
            >
              {t('landlordPortal')}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('pricing-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-emerald-800 transition-colors font-semibold"
            >
              Pro Plans (200 ETB)
            </button>
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="hover:text-emerald-800 transition-colors flex items-center gap-1 font-semibold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t('googleSheets')}</span>
            </button>
          </div>

          <p className="text-slate-400">
            Telebirr & CBE Birr Ethiopian Payment Verified
          </p>
        </div>
      </footer>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">
              {compareList.length} of 3 apartments selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              {t('compare')}
            </button>
            <button
              onClick={() => setCompareList([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ApartmentDetailModal
        apartment={selectedApartmentForDetail}
        isOpen={!!selectedApartmentForDetail}
        onClose={() => setSelectedApartmentForDetail(null)}
        isFavorite={selectedApartmentForDetail ? favorites.includes(selectedApartmentForDetail.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onApply={(apt) => {
          setSelectedApartmentForDetail(null);
          setSelectedApartmentForApply(apt);
        }}
        onSendMessage={(apt) => {
          setSelectedApartmentForDetail(null);
          setSelectedApartmentForMessage(apt);
        }}
      />

      <RentalApplicationModal
        apartment={selectedApartmentForApply}
        isOpen={!!selectedApartmentForApply}
        onClose={() => setSelectedApartmentForApply(null)}
        onApplicationSubmitted={(app) => {
          setApplications((prev) => [app, ...prev]);
          showToast(`Lease application submitted to landlord!`);
        }}
        token={token}
        connectedSheet={connectedSheet}
        autoSyncApplications={autoSyncApplications}
      />

      <MessageLandlordModal
        apartment={selectedApartmentForMessage}
        isOpen={!!selectedApartmentForMessage}
        onClose={() => setSelectedApartmentForMessage(null)}
      />

      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        apartments={compareList}
        onRemoveFromCompare={handleRemoveFromCompare}
        onSelectApartment={(apt) => {
          setIsCompareModalOpen(false);
          setSelectedApartmentForDetail(apt);
        }}
      />

      <GoogleSheetsManager
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        user={user}
        token={token}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        listings={apartments}
        onImportListings={handleImportListings}
        connectedSheet={connectedSheet}
        setConnectedSheet={setConnectedSheet}
        autoSyncApplications={autoSyncApplications}
        setAutoSyncApplications={setAutoSyncApplications}
      />

      <AddListingModal
        isOpen={isAddListingModalOpen}
        onClose={() => setIsAddListingModalOpen(false)}
        onAddListing={handleAddListing}
        currentPropertyCount={apartments.length}
      />

      <RenterDashboardModal
        isOpen={isRenterActivityModalOpen}
        onClose={() => setIsRenterActivityModalOpen(false)}
        favorites={favoriteApartments}
        onRemoveFavorite={handleToggleFavorite}
        onSelectApartment={setSelectedApartmentForDetail}
        applications={applications}
      />

      {/* Requirement 4: Subscription/Pro Checkout Modal with exact manual details & receipt upload */}
      <SubscriptionPaymentModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        planName="Rentora Pro Landlord Plan"
        amountEtb={200}
        onPaymentSuccess={(payment) => {
          setPayments((prev) => [payment, ...prev]);
          setHasPaidPro(true);
          if (token && connectedSheet) {
            appendFeePaymentToSheet(token, connectedSheet.spreadsheetId, payment).catch(console.error);
          }
          showToast(
            `Pro Plan activated! 200 ETB verified via ${
              payment.paymentMethod === 'telebirr' ? 'Telebirr (0976886009)' : 'CBE (1000750859619)'
            }`
          );
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <RentoraMain />
    </LanguageProvider>
  );
}
