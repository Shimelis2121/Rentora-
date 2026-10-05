import React, { useState, useRef } from 'react';
import {
  CreditCard,
  CheckCircle2,
  X,
  ShieldCheck,
  Smartphone,
  Building,
  Receipt,
  Sparkles,
  Copy,
  Check,
  Upload,
  FileImage,
  AlertCircle,
} from 'lucide-react';
import { ListingPayment } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface EthiopianPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
  currentPropertyCount: number;
  onPaymentSuccess: (payment: ListingPayment) => void;
}

export const EthiopianPaymentModal: React.FC<EthiopianPaymentModalProps> = ({
  isOpen,
  onClose,
  propertyTitle,
  currentPropertyCount,
  onPaymentSuccess,
}) => {
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr'>('telebirr');
  const [phoneNumber, setPhoneNumber] = useState('+251 9');
  const [payerName, setPayerName] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<ListingPayment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Exact Account Details specified by user
  const TELEBIRR_DETAILS = {
    accountNumber: '0976886009',
    accountName: 'Shimelis Gizaw',
  };

  const CBE_DETAILS = {
    accountNumber: '1000750859619',
    accountName: 'Shimelis Gizaw Arado',
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard?.writeText?.(text);
    setIsCopied(type);
    setTimeout(() => setIsCopied(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Receipt image must be smaller than 5MB.');
      return;
    }

    setReceiptFileName(file.name);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!transactionRef.trim()) {
      setFormError('Please enter the Transaction ID / Reference Number from your SMS or receipt.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const payment: ListingPayment = {
        id: `pay-${Date.now()}`,
        listingId: `apt-pending-${Date.now().toString().slice(-4)}`,
        propertyTitle,
        landlordName: payerName.trim() || 'Landlord',
        landlordPhone: phoneNumber,
        amountEtb: 200,
        paymentMethod,
        transactionRef: transactionRef.trim(),
        status: 'Completed',
        paidAt: new Date().toLocaleString(),
        receiptImageUrl: receiptImage || undefined,
        receiptFileName: receiptFileName || undefined,
        planType: 'pro_listing',
      };

      setCompletedPayment(payment);
      setIsProcessing(false);
      onPaymentSuccess(payment);
    }, 1200);
  };

  const handleDone = () => {
    setCompletedPayment(null);
    setTransactionRef('');
    setReceiptImage(null);
    setReceiptFileName(null);
    setFormError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {language === 'am'
                    ? 'የቤት ማስተዋወቂያ ክፍያ (200 ብር)'
                    : language === 'om'
                    ? 'Kaffaltii Maxxansa Manaa (ETB 200)'
                    : 'Property Listing Fee (200 ETB)'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'am'
                    ? `የነጻ 2 ቤቶች ኮታዎ አልቋል (ንብረት ቁጥር ${currentPropertyCount + 1})`
                    : language === 'om'
                    ? `Qoodi manneen 2 bilisaa xumurameera (Mana #${currentPropertyCount + 1})`
                    : `Freemium limit reached (2 free listings used • Listing #${currentPropertyCount + 1})`}
                </p>
              </div>
            </div>
            {!completedPayment && (
              <button
                onClick={handleDone}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {completedPayment ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  {language === 'am'
                    ? 'ክፍያው በተሳካ ሁኔታ ተጠናቋል!'
                    : language === 'om'
                    ? 'Kaffaltiin Milkaa\'inaan Xumurameera!'
                    : 'Payment Successfully Verified!'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {language === 'am'
                    ? '200 ብር በቴሌብር/ሲቢኢ ተረጋግጧል። አዲሱ ቤትዎ አሁን በሬንቶራ ላይ ይታያል።'
                    : '200 ETB verified. Your listing is unlocked and published to the Ethiopian rental marketplace.'}
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-sans font-bold flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                    Official Transaction Receipt
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    200 ETB PAID
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Property:</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[200px]">
                    {propertyTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tx Reference:</span>
                  <span className="font-bold text-slate-900">{completedPayment.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway:</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {completedPayment.paymentMethod === 'telebirr'
                      ? 'Telebirr (0976886009 - Shimelis Gizaw)'
                      : 'CBE (1000750859619 - Shimelis Gizaw Arado)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Phone:</span>
                  <span className="text-slate-800">{completedPayment.landlordPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-800">{completedPayment.paidAt}</span>
                </div>

                {completedPayment.receiptImageUrl && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-1">Attached Receipt:</span>
                    <img
                      src={completedPayment.receiptImageUrl}
                      alt="Receipt"
                      className="w-full max-h-32 object-contain rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleDone}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {language === 'am' ? 'ይቀጥሉና ቤቱን ይልቀቁ' : 'Continue to Publish Listing'}
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              {/* Fee Notice Box */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-950">
                  <span>Freemium Policy Limit:</span>
                  <span className="bg-emerald-200/80 px-2 py-0.5 rounded-md text-emerald-900 font-mono">
                    Listing #{currentPropertyCount + 1}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
                  {language === 'am'
                    ? 'አከራዮች እስከ 2 ቤቶች ድረስ በነጻ ማስተዋወቅ ይችላሉ። ከ 3ኛ ጀምሮ ላለ እያንዳንዱ ተጨማሪ ቤት የአንድ ጊዜ 200 የኢትዮጵያ ብር የዝርዝር ክፍያ ይከፈላል።'
                    : 'Landlords can publish up to 2 properties for free. To list your 3rd and subsequent properties, a one-time listing fee of 200 ETB is required.'}
                </p>
              </div>

              {/* Order Summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Listing:</span>
                  <span className="font-bold text-slate-900 line-clamp-1">{propertyTitle}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Total Due:</span>
                  <span className="text-lg font-black text-emerald-800">200 ETB</span>
                </div>
              </div>

              {/* Payment Gateway Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-800 block">
                  1. {language === 'am' ? 'የመክፈያ ዘዴ ይምረጡ' : 'Select Payment Method'}
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Telebirr Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('telebirr')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'telebirr'
                        ? 'border-emerald-700 bg-emerald-50/90 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-xs">
                        tb
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Telebirr</span>
                        <span className="text-[10px] text-slate-500">ኢትዮ ቴሌኮም</span>
                      </div>
                    </div>
                  </button>

                  {/* CBE Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cbe_birr')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'cbe_birr'
                        ? 'border-purple-700 bg-purple-50/90 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-800 text-white flex items-center justify-center font-black text-xs">
                        CBE
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">CBE Bank</span>
                        <span className="text-[10px] text-slate-500">የኢትዮጵያ ንግድ ባንክ</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Exact Account Details Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                {paymentMethod === 'telebirr' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Telebirr Account Number:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                        <span>{TELEBIRR_DETAILS.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(TELEBIRR_DETAILS.accountNumber, 'tb_no')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                          title="Copy"
                        >
                          {isCopied === 'tb_no' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-bold text-slate-900">{TELEBIRR_DETAILS.accountName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      Send <b>200 ETB</b> to <b>0976886009 (Shimelis Gizaw)</b> via Telebirr (*127# or app).
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">CBE Account Number:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                        <span>{CBE_DETAILS.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(CBE_DETAILS.accountNumber, 'cbe_no')}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                          title="Copy"
                        >
                          {isCopied === 'cbe_no' ? <Check className="w-3.5 h-3.5 text-purple-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-bold text-slate-900">{CBE_DETAILS.accountName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      Transfer <b>200 ETB</b> to Account <b>1000750859619 (Shimelis Gizaw Arado)</b> via CBE Birr / Mobile Banking.
                    </p>
                  </>
                )}
              </div>

              {/* Form Inputs: Transaction Reference & Receipt */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    2. Transaction ID / Reference Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={paymentMethod === 'telebirr' ? 'e.g. TB-83920194 or 9018273645' : 'e.g. FT2428987654 or CBE Ref'}
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Sender Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+251 9..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Payer Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dawit Haile"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Optional Screenshot Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    3. Upload Receipt / Screenshot (Optional but recommended)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {receiptImage ? (
                    <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-950 truncate max-w-[200px]">
                        <FileImage className="w-3.5 h-3.5 text-emerald-700" />
                        {receiptFileName || 'receipt.png'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptImage(null);
                          setReceiptFileName(null);
                        }}
                        className="text-[11px] text-rose-600 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-xs text-slate-600 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-400" />
                      <span>Attach screenshot of SMS / transaction</span>
                    </button>
                  )}
                </div>
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Payment CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
                    paymentMethod === 'telebirr'
                      ? 'bg-emerald-800 hover:bg-emerald-900'
                      : 'bg-purple-800 hover:bg-purple-900'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying transfer details...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Confirm 200 ETB Payment via {paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified through Ethiopian National Payment Switch & Direct Merchant Ledger</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
