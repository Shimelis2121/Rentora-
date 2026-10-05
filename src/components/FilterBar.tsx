import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  MapPin,
  ArrowUpDown,
  RotateCcw,
  Zap,
  Droplets,
  Shield,
  ArrowUpNarrowWide,
} from 'lucide-react';
import { FilterState } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { EthiopianLocationSelector } from './EthiopianLocationSelector';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'list' | 'map';
  onViewModeChange: (mode: 'grid' | 'list' | 'map') => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (partial: Partial<FilterState>) => {
    onFilterChange({ ...filters, ...partial });
  };

  const handleLocationChange = (regId: string, zId: string, wId: string) => {
    update({
      regionId: regId,
      zoneId: zId,
      woredaId: wId,
    });
  };

  const handleGpsLocate = (coords: { lat: number; lng: number } | null) => {
    update({
      userLocation: coords,
      sortBy: coords ? 'distance' : filters.sortBy,
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.regionId !== 'all' ||
    filters.zoneId !== 'all' ||
    filters.woredaId !== 'all' ||
    filters.bedrooms !== 'all' ||
    filters.propertyType !== 'all' ||
    filters.selectedRadiusKm !== undefined ||
    filters.petFriendlyOnly ||
    filters.inUnitLaundryOnly ||
    filters.parkingOnly ||
    filters.balconyOnly ||
    filters.generatorOnly ||
    filters.waterTankOnly ||
    filters.securityGuardOnly ||
    filters.elevatorOnly ||
    filters.maxPrice < 150000;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filters.searchQuery}
            onChange={(e) => update({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => update({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Drawer Toggle & Sort & Views */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Advanced Filters Button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showAdvanced || hasActiveFilters
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('filtersBtn')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select
              value={filters.sortBy}
              onChange={(e) => update({ sortBy: e.target.value as any })}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="recommended">{t('sortFeatured')}</option>
              {filters.userLocation && (
                <option value="distance">{t('sortByDistance')}</option>
              )}
              <option value="price-asc">{t('sortPriceAsc')}</option>
              <option value="price-desc">{t('sortPriceDesc')}</option>
              <option value="sqft-desc">{t('sortSqft')}</option>
              <option value="walkscore-desc">{t('sortWalkscore')}</option>
            </select>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => onViewModeChange('grid')}
              title={t('viewGrid')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title={t('viewList')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              title={t('viewMap')}
              className={`p-1.5 rounded-xl transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hierarchical Ethiopian Location Selector: Region -> Zone -> Woreda with GPS */}
      <EthiopianLocationSelector
        selectedRegionId={filters.regionId}
        selectedZoneId={filters.zoneId}
        selectedWoredaId={filters.woredaId}
        onSelectLocation={handleLocationChange}
        onGpsLocate={handleGpsLocate}
        userCoords={filters.userLocation}
        selectedRadiusKm={filters.selectedRadiusKm}
        onSelectRadius={(radiusKm) => update({ selectedRadiusKm: radiusKm })}
      />

      {/* Expandable Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Max Price Range (ETB) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">{t('maxBudget')}</span>
                <span className="font-bold text-emerald-800">
                  {filters.maxPrice.toLocaleString()} {t('currencyPerMonth')}
                </span>
              </div>
              <input
                type="range"
                min={15000}
                max={150000}
                step={5000}
                value={filters.maxPrice}
                onChange={(e) => update({ maxPrice: Number(e.target.value) })}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('bedrooms')}
              </label>
              <select
                value={filters.bedrooms}
                onChange={(e) => update({ bedrooms: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="all">{t('anyBedrooms')}</option>
                <option value="0">{t('studio')}</option>
                <option value="1">{t('bed1')}</option>
                <option value="2">{t('bed2')}</option>
                <option value="3+">{t('bed3Plus')}</option>
              </select>
            </div>

            {/* Property Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('residenceType')}
              </label>
              <select
                value={filters.propertyType}
                onChange={(e) => update({ propertyType: e.target.value })}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="all">{t('allTypes')}</option>
                <option value="Apartment">{t('apartment')}</option>
                <option value="Loft">{t('loft')}</option>
                <option value="Studio">{t('studio')}</option>
                <option value="Penthouse">{t('penthouse')}</option>
                <option value="Condo">{t('condo')}</option>
                <option value="Townhome">{t('townhome')}</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={onResetFilters}
                className="w-full py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('resetFilters')}</span>
              </button>
            </div>
          </div>

          {/* Quick Amenity Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-100">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <input
                type="checkbox"
                checked={filters.generatorOnly}
                onChange={(e) => update({ generatorOnly: e.target.checked })}
                className="rounded-sm text-emerald-600"
              />
              <span>{t('generatorBackup')}</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-100">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <input
                type="checkbox"
                checked={filters.waterTankOnly}
                onChange={(e) => update({ waterTankOnly: e.target.checked })}
                className="rounded-sm text-emerald-600"
              />
              <span>{t('waterReservoir')}</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-100">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <input
                type="checkbox"
                checked={filters.securityGuardOnly}
                onChange={(e) => update({ securityGuardOnly: e.target.checked })}
                className="rounded-sm text-emerald-600"
              />
              <span>{t('securityGuard')}</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={filters.inUnitLaundryOnly}
                onChange={(e) => update({ inUnitLaundryOnly: e.target.checked })}
                className="rounded-sm text-emerald-600"
              />
              <span>{t('inUnitLaundry')}</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={filters.parkingOnly}
                onChange={(e) => update({ parkingOnly: e.target.checked })}
                className="rounded-sm text-emerald-600"
              />
              <span>{t('parkingSpot')}</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={filters.balconyOnly}
                onChange={(e) => update({ balconyOnly: e.target.checked })}
                className="rounded-sm text-emerald-600"
              />
              <span>{t('balconyTerrace')}</span>
            </label>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={filters.petFriendlyOnly}
                onChange={(e) => update({ petFriendlyOnly: e.target.checked })}
                className="rounded-sm text-emerald-600"
              />
              <span>{t('petFriendly')}</span>
            </label>
          </div>
        </div>
      )}

      {/* Result count banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          {t('showingResults')} <b>{totalResults}</b> {t('availableHomes')}
        </span>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-emerald-700 hover:text-emerald-800 font-semibold underline"
          >
            {t('clearActiveFilters')}
          </button>
        )}
      </div>
    </div>
  );
};
