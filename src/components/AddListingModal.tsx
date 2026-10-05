import React, { useState } from 'react';
import {
  PlusCircle,
  X,
  Home,
  DollarSign,
  Image as ImageIcon,
  MapPin,
  Crosshair,
  Check,
  Zap,
  Droplets,
  Shield,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { Apartment, ListingPayment } from '../types';
import {
  ETHIOPIAN_REGIONS,
  ETHIOPIAN_ZONES,
  ETHIOPIAN_WOREDAS,
  isInsideEthiopia,
  DEFAULT_ETHIOPIA_CENTER,
} from '../data/ethiopianLocations';
import { useTranslation } from '../i18n/LanguageContext';
import { EthiopianPaymentModal } from './EthiopianPaymentModal';
import { PinDropperMapModal } from './PinDropperMapModal';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddListing: (apartment: Apartment, payment?: ListingPayment) => void;
  currentPropertyCount: number;
}

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80',
];

export const AddListingModal: React.FC<AddListingModalProps> = ({
  isOpen,
  onClose,
  onAddListing,
  currentPropertyCount,
}) => {
  const { t, language } = useTranslation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [regionId, setRegionId] = useState('reg-aa');
  const [zoneId, setZoneId] = useState('zone-bole');
  const [woredaId, setWoredaId] = useState('wor-bole-atlas');
  const [price, setPrice] = useState<number | ''>(45000);
  const [deposit, setDeposit] = useState<number | ''>(45000);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqft, setSqft] = useState<number | ''>(110);
  const [propertyType, setPropertyType] = useState<Apartment['propertyType']>('Apartment');
  const [petPolicy, setPetPolicy] = useState<Apartment['petPolicy']>('Cats & Dogs Allowed');
  const [inUnitLaundry, setInUnitLaundry] = useState(true);
  const [parking, setParking] = useState(true);
  const [balcony, setBalcony] = useState(true);
  const [centralAC, setCentralAC] = useState(false);
  const [hasGenerator, setHasGenerator] = useState(true);
  const [hasWaterTank, setHasWaterTank] = useState(true);
  const [hasSecurityGuard, setHasSecurityGuard] = useState(true);
  const [hasElevator, setHasElevator] = useState(true);

  // Exact Coordinates
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 8.9984,
    lng: 38.7831,
  });

  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Payment state for 3rd+ listing (200 ETB fee)
  const isFeeRequired = currentPropertyCount >= 2;
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<ListingPayment | null>(null);
  const [isPinDropperOpen, setIsPinDropperOpen] = useState(false);

  if (!isOpen) return null;

  const availableZones = ETHIOPIAN_ZONES.filter((z) => z.parentId === regionId);
  const availableWoredas = ETHIOPIAN_WOREDAS.filter((w) => w.parentId === zoneId);

  const handleRegionChange = (newRegId: string) => {
    setRegionId(newRegId);
    const firstZone = ETHIOPIAN_ZONES.find((z) => z.parentId === newRegId);
    if (firstZone) {
      setZoneId(firstZone.id);
      const firstWoreda = ETHIOPIAN_WOREDAS.find((w) => w.parentId === firstZone.id);
      if (firstWoreda) {
        setWoredaId(firstWoreda.id);
        setCoordinates(firstWoreda.coordinates);
      }
    }
  };

  const handleZoneChange = (newZoneId: string) => {
    setZoneId(newZoneId);
    const firstWoreda = ETHIOPIAN_WOREDAS.find((w) => w.parentId === newZoneId);
    if (firstWoreda) {
      setWoredaId(firstWoreda.id);
      setCoordinates(firstWoreda.coordinates);
    }
  };

  const handleWoredaChange = (newWoredaId: string) => {
    setWoredaId(newWoredaId);
    const wor = ETHIOPIAN_WOREDAS.find((w) => w.id === newWoredaId);
    if (wor) {
      setCoordinates(wor.coordinates);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !address || !price || !sqft) return;

    // Check freemium limit: If user has 2 or more listings and hasn't paid 200 ETB yet, prompt payment
    if (isFeeRequired && !completedPayment) {
      setIsPaymentModalOpen(true);
      return;
    }

    const finalImage = customImageUrl.trim() || selectedImage;
    const selectedReg = ETHIOPIAN_REGIONS.find((r) => r.id === regionId);
    const selectedZ = ETHIOPIAN_ZONES.find((z) => z.id === zoneId);
    const selectedW = ETHIOPIAN_WOREDAS.find((w) => w.id === woredaId);

    const amenitiesList: string[] = [];
    if (hasGenerator) amenitiesList.push(t('generatorBackup'));
    if (hasWaterTank) amenitiesList.push(t('waterReservoir'));
    if (hasSecurityGuard) amenitiesList.push(t('securityGuard'));
    if (hasElevator) amenitiesList.push(t('elevator'));
    if (parking) amenitiesList.push(t('parkingSpot'));
    if (balcony) amenitiesList.push(t('balconyTerrace'));
    if (inUnitLaundry) amenitiesList.push(t('inUnitLaundry'));

    const newApartment: Apartment = {
      id: `apt-eth-${Date.now().toString().slice(-4)}`,
      title,
      description:
        description ||
        `Spacious residence in ${selectedZ?.nameEn || 'Addis Ababa'}. Features reliable water reservoir tank, backup power, secure parking, and clean finishes.`,
      address,
      neighborhood: selectedW?.nameEn || selectedZ?.nameEn || 'Bole',
      city: selectedReg?.nameEn || 'Addis Ababa',
      state: selectedReg?.nameEn || 'Addis Ababa',
      zip: '1000',
      regionId,
      zoneId,
      woredaId,
      price: Number(price),
      deposit: Number(deposit) || Number(price),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      sqft: Number(sqft),
      availableDate: new Date().toISOString().split('T')[0],
      images: [finalImage, PRESET_IMAGES[1], PRESET_IMAGES[2]],
      propertyType,
      petPolicy,
      inUnitLaundry,
      parking,
      balcony,
      centralAC,
      furnished: false,
      amenities: amenitiesList,
      landlord: {
        id: 'host-landlord',
        name: 'Landlord Host',
        phone: '+251 91 234 5678',
        email: 'landlord@rentora.et',
        rating: 4.95,
        reviewsCount: 14,
        responseTime: '< 15 mins',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      walkScore: 92,
      transitScore: 90,
      bikeScore: 84,
      coordinates,
      status: 'Available',
      isPaidListing: isFeeRequired || !!completedPayment,
      paymentRef: completedPayment?.transactionRef,
    };

    onAddListing(newApartment, completedPayment || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
                <PlusCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{t('addListingTitle')}</h3>
                <p className="text-xs text-slate-300">{t('addListingDesc')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {/* Freemium Policy & Listing Fee Notice */}
          {isFeeRequired ? (
            <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs space-y-2 shadow-xs">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  {language === 'am'
                    ? 'የነጻ 2 ቤቶች ገደብ አልቋል (200 ብር ክፍያ ያስፈልጋል)'
                    : language === 'om'
                    ? 'Qoodi manneen 2 bilisaa xumurameera (ETB 200)'
                    : 'Freemium Limit Reached (200 ETB Fee Required)'}
                </span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md font-mono font-bold text-[10px]">
                  Property #{currentPropertyCount + 1}
                </span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                {language === 'am'
                  ? `አከራዮች እስከ 2 ቤቶች ድረስ በነጻ መመዝገብ ይችላሉ (አሁን ${currentPropertyCount} ቤቶች አሉዎት)። ይህንን ተጨማሪ ቤት ለመልቀቅ የአንድ ጊዜ የ 200 ብር የዝርዝር ክፍያ በቴሌብር ወይም በሲቢኢ ብር መክፈል ይኖርብዎታል።`
                  : language === 'om'
                  ? `Abbaan qabeenyaa manneen 2 bilisaan galmeessuuf eeyyamama (Amma manneen ${currentPropertyCount} qabdu). Mana dabalataa kanaaf ETB 200 kaffaluun barbaachisaadha.`
                  : `Landlords can publish up to 2 properties for free (you currently have ${currentPropertyCount} properties). To list this 3rd or subsequent property, a 200 ETB listing fee via Telebirr or CBE Birr is required.`}
              </p>

              {completedPayment ? (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-950 font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    200 ETB Verified via {completedPayment.paymentMethod === 'telebirr' ? 'telebirr' : 'CBE Birr'} (Ref: {completedPayment.transactionRef})
                  </span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                    Payment Verified
                  </span>
                </div>
              ) : (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Telebirr (*127#) or CBE Birr (*847#)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                  >
                    Pay 200 ETB Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'am'
                    ? `የነጻ ኮታ ገቢር ነው (ቤት ${currentPropertyCount + 1} ከ 2 ነጻ ቤቶች)`
                    : `Free Tier Active (Listing #${currentPropertyCount + 1} of 2 Free Properties)`}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md font-bold text-[10px]">
                0 ETB • Free
              </span>
            </div>
          )}

          {/* Ethiopian Administrative Hierarchy */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ethiopian Administrative Hierarchy (አስተዳደራዊ መዋቅር)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  1. {t('selectRegion')}
                </label>
                <select
                  value={regionId}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  {ETHIOPIAN_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nameEn} ({r.nameAm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  2. {t('selectZone')}
                </label>
                <select
                  value={zoneId}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  {availableZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  3. {t('selectWoreda')}
                </label>
                <select
                  value={woredaId}
                  onChange={(e) => handleWoredaChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  {availableWoredas.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Ethiopia Map Pin Dropper & Reverse Geocoding */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Exact Property Map Location</span>
                </span>
                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Inside Ethiopia
                </span>
              </div>

              {/* Pin Dropper Action Button */}
              <button
                type="button"
                onClick={() => setIsPinDropperOpen(true)}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-300 animate-bounce" />
                <span>📍 Drop & Drag Pin on Ethiopia Map (Auto-Detect Address)</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-mono block mb-0.5">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Latitude (e.g. 9.01)"
                    value={coordinates.lat}
                    onChange={(e) =>
                      setCoordinates({ ...coordinates, lat: parseFloat(e.target.value) || 9.0 })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono block mb-0.5">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Longitude (e.g. 38.78)"
                    value={coordinates.lng}
                    onChange={(e) =>
                      setCoordinates({ ...coordinates, lng: parseFloat(e.target.value) || 38.7 })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Basic Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('propertyOverview')}</span>
            </h4>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('listingTitle')}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bole Atlas Modern 2BR Luxury Flat"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                {t('streetAddress')}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Namibia St, Near Edna Mall & Atlas Hotel"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pricing & Dimensions (ETB) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('financialQualification')} ({t('currency')})</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t('rentPerMonthInput')}
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || '')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t('depositInput')}
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value) || '')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t('bedrooms')}
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value={0}>{t('studio')}</option>
                  <option value={1}>{t('bed1')}</option>
                  <option value={2}>{t('bed2')}</option>
                  <option value={3}>{t('bed3Plus')}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Bathrooms</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value={1}>1 Bath</option>
                  <option value={1.5}>1.5 Baths</option>
                  <option value={2}>2 Baths</option>
                  <option value={2.5}>2.5 Baths</option>
                  <option value={3}>3+ Baths</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t('squareMeters')}
                </label>
                <input
                  type="number"
                  required
                  min={20}
                  value={sqft}
                  onChange={(e) => setSqft(Number(e.target.value) || '')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t('residenceType')}
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Apartment">{t('apartment')}</option>
                  <option value="Loft">{t('loft')}</option>
                  <option value="Studio">{t('studio')}</option>
                  <option value="Penthouse">{t('penthouse')}</option>
                  <option value="Condo">{t('condo')}</option>
                  <option value="Townhome">{t('townhome')}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Pet Policy
                </label>
                <select
                  value={petPolicy}
                  onChange={(e) => setPetPolicy(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Cats & Dogs Allowed">Cats & Dogs Allowed</option>
                  <option value="Cats Only">Cats Only</option>
                  <option value="Small Dogs Only">Small Dogs Only</option>
                  <option value="No Pets">No Pets</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ethiopian Vital Amenities Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Essential Utilities & Amenities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasGenerator}
                  onChange={(e) => setHasGenerator(e.target.checked)}
                  className="rounded-sm text-emerald-700"
                />
                <span className="font-semibold">{t('generatorBackup')}</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWaterTank}
                  onChange={(e) => setHasWaterTank(e.target.checked)}
                  className="rounded-sm text-emerald-700"
                />
                <span className="font-semibold">{t('waterReservoir')}</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSecurityGuard}
                  onChange={(e) => setHasSecurityGuard(e.target.checked)}
                  className="rounded-sm text-emerald-700"
                />
                <span className="font-semibold">{t('securityGuard')}</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasElevator}
                  onChange={(e) => setHasElevator(e.target.checked)}
                  className="rounded-sm text-emerald-700"
                />
                <span className="font-semibold">{t('elevator')}</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={parking}
                  onChange={(e) => setParking(e.target.checked)}
                  className="rounded-sm text-emerald-700"
                />
                <span>{t('parkingSpot')}</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={balcony}
                  onChange={(e) => setBalcony(e.target.checked)}
                  className="rounded-sm text-emerald-700"
                />
                <span>{t('balconyTerrace')}</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={inUnitLaundry}
                  onChange={(e) => setInUnitLaundry(e.target.checked)}
                  className="rounded-sm text-emerald-700"
                />
                <span>{t('inUnitLaundry')}</span>
              </label>
            </div>
          </div>

          {/* Photo Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Cover Photography</span>
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_IMAGES.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setSelectedImage(img);
                    setCustomImageUrl('');
                  }}
                  className={`aspect-4/3 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === img && !customImageUrl
                      ? 'border-emerald-700 ring-2 ring-emerald-500/20'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] text-slate-500 block mb-1">
                Or enter custom image URL:
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 ${
                isFeeRequired && !completedPayment
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-800 hover:bg-emerald-900'
              }`}
            >
              {isFeeRequired && !completedPayment ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {language === 'am'
                      ? 'የ 200 ብር ክፍያ ከፍለው ቤቱን ይልቀቁ'
                      : language === 'om'
                      ? 'Kaffaltii ETB 200 Kaffaluun Maxxansi'
                      : 'Pay 200 ETB Listing Fee & Publish'}
                  </span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {completedPayment
                      ? language === 'am'
                        ? 'የተከፈለበትን ቤት ይፋ አድርግ (200 ብር ተከፍሏል)'
                        : 'Publish Paid Listing (200 ETB Verified)'
                      : t('publishBtn')}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Ethiopia Map Pin Dropper Modal */}
      <PinDropperMapModal
        isOpen={isPinDropperOpen}
        onClose={() => setIsPinDropperOpen(false)}
        initialCoords={coordinates}
        onConfirmLocation={(res) => {
          setCoordinates(res.coordinates);
          setAddress(res.address);
          if (res.regionId) setRegionId(res.regionId);
          if (res.zoneId) setZoneId(res.zoneId);
          if (res.woredaId) setWoredaId(res.woredaId);
        }}
      />

      {/* 200 ETB Payment Modal for Telebirr / CBE Birr */}
      <EthiopianPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        propertyTitle={title || 'New Ethiopian Property'}
        currentPropertyCount={currentPropertyCount}
        onPaymentSuccess={(payment) => {
          setCompletedPayment(payment);
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
};
