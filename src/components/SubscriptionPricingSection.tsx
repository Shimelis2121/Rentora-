import React from 'react';
import {
  Check,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Building,
  Search,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  Receipt,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface SubscriptionPricingSectionProps {
  onSelectFree: () => void;
  onSelectPro: () => void;
  currentPropertyCount: number;
  hasPaidPro?: boolean;
}

export const SubscriptionPricingSection: React.FC<SubscriptionPricingSectionProps> = ({
  onSelectFree,
  onSelectPro,
  currentPropertyCount,
  hasPaidPro,
}) => {
  const { t, language } = useTranslation();

  return (
    <section id="pricing-section" className="py-12 sm:py-16 space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>
            {language === 'am'
              ? 'የአባልነትና የክፍያ እቅዶች'
              : language === 'om'
              ? 'PILAAWOOTA KIREESSUU FI BARBAADUU'
              : 'SUBSCRIPTION & PRO PLANS'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {language === 'am'
            ? 'ግልጽና ቀላል የኪራይና የማስተዋወቂያ እቅዶች'
            : language === 'om'
            ? 'Pilaanii Isiniif Ta\'u Filadhaa'
            : 'Simple, Transparent Ethiopian Rental Plans'}
        </h2>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {language === 'am'
            ? 'ተከራዮች ሁልጊዜም በነጻ ቤቶችን ይፈልጋሉ፤ አከራዮች የመጀመሪያዎቹን 2 ቤቶች በነጻ ይለጥፋሉ፤ ከ 3ኛ ጀምሮ በ 200 ብር ብቻ የፕሮ እቅድን ያገኛሉ።'
            : language === 'om'
            ? 'Kireeffattoonni yeroo hundaa bilisaan barbaadu. Abbootiin manaa manneen 2 bilisaan maxxansu, sana booda ETB 200 qofaan Pilaanii Pro argatu.'
            : 'Renters browse & contact directly for free. Landlords can publish up to 2 free properties or upgrade to Pro (200 ETB) for multiple properties, top placement, and verified badges.'}
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* Tier 1: Free Plan */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 flex flex-col justify-between relative">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full uppercase tracking-wider">
                {language === 'am' ? 'ነጻ እቅድ' : language === 'om' ? 'Bilisa' : 'Free Tier'}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {language === 'am' ? 'ለሁሉም ተከራዮች' : 'Renters & Starters'}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-slate-900">0</span>
                <span className="text-xl font-bold text-slate-700">ETB</span>
                <span className="text-xs text-slate-500 ml-1">/ Always Free</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {language === 'am'
                  ? 'ቤቶችን ለመፈለግ፣ በቀጥታ ከአከራይ ጋር ለመገናኘትና የመጀመሪያ 2 ቤቶችን ለመመዝገብ።'
                  : 'Perfect for apartment seekers searching throughout Ethiopia and landlords listing their first 2 properties.'}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <b>Unlimited Apartment Search</b> across all Ethiopian regions, sub-cities & woredas
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <b>GPS & Interactive Map:</b> Pinpoint residences and browse near your current location
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <b>Direct Landlord Contact:</b> Phone calls, WhatsApp, Telegram, and in-app message
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <b>Landlord Basic Quota:</b> Post up to <b>2 Properties for Free</b>
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  Save favorite wishlist homes and compare up to 3 apartments side-by-side
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>
                  <b>0% Broker Fees:</b> No hidden agent commissions or middleman costs
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={onSelectFree}
              className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>
                {language === 'am'
                  ? 'ቤቶችን በነጻ ፈልግ (Mana Barbaadi)'
                  : language === 'om'
                  ? 'Mana Barbaadi (Bilisa)'
                  : 'Start Browsing (Mana Barbaadi)'}
              </span>
            </button>
          </div>
        </div>

        {/* Tier 2: Pro Plan (200 ETB) */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl border-2 border-emerald-500/80 shadow-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Top highlight badge */}
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black uppercase px-4 py-1 rounded-bl-2xl tracking-wider shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              <span>Recommended for Landlords</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30 uppercase tracking-wider">
                {language === 'am' ? 'ፕሮ እቅድ' : language === 'om' ? 'Pilaanii Pro' : 'Pro Landlord Plan'}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black text-white">200</span>
                <span className="text-xl font-bold text-emerald-400">ETB</span>
                <span className="text-xs text-slate-400 ml-1">/ per property listing</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                {language === 'am'
                  ? 'ለአከራዮችና ለደላሎች የተዘጋጀ፤ ከ 3ኛ ጀምሮ ያሉ ቤቶችን ለመልቀቅና በገበያው ላይ ቀዳሚ ሆኖ ለመታየት።'
                  : 'Designed for landlords, developers, and brokers to post 3rd+ properties, get verified badges, and sync with Google Sheets.'}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-200">
              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-500 text-slate-950 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <b className="text-white">Post 3rd & Unlimited Properties:</b> Unlocks the 2-property freemium limit
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-500 text-slate-950 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <b className="text-emerald-300">Verified Landlord Trust Seal:</b> Verified icon displayed on all listings
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-500 text-slate-950 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <b className="text-white">Priority Marketplace Placement:</b> Featured badge and top ranking in search
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-500 text-slate-950 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <b className="text-white">Google Sheets Auto-Sync:</b> Automatic sync for listings, applications, & fees
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-500 text-slate-950 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <b>Direct Tenant Inquiries:</b> Instant alerts when tenants message or apply
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-emerald-500 text-slate-950 mt-0.5 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>
                  <b>Local Payment:</b> Telebirr (0976886009) or CBE (1000750859619) with official receipt
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-2">
            <button
              onClick={onSelectPro}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>
                {language === 'am'
                  ? 'ወደ ፕሮ እቅድ አሳድግ (200 ብር)'
                  : language === 'om'
                  ? 'Pilaanii Pro Filadhaa (ETB 200)'
                  : 'Upgrade to Pro Plan (200 ETB)'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Instant activation via Telebirr or CBE receipt verification
            </p>
          </div>
        </div>
      </div>

      {/* Manual Payment Information Card */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 block">
                Official Ethiopian Payment Channels for Pro Plan
              </span>
              <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                <span>
                  🟢 <b>Telebirr:</b> 0976886009 (Shimelis Gizaw)
                </span>
                <span>
                  🟣 <b>CBE Account:</b> 1000750859619 (Shimelis Gizaw Arado)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onSelectPro}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pay & Upload Receipt</span>
          </button>
        </div>
      </div>
    </section>
  );
};
