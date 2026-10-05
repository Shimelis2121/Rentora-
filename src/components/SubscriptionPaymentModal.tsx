import React, { useState, useRef } from 'react';
import {
  CreditCard,
  CheckCircle2,
  X,
  Copy,
  Check,
  Upload,
  Receipt,
  Smartphone,
  Building,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileImage,
  ExternalLink,
} from 'lucide-react';
import { ListingPayment } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (payment: ListingPayment) => void;
  planName?: string;
  amountEtb?: number;
}

export const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  planName = 'Pro Landlord Plan',
  amountEtb = 200,
}) => {
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr'>('telebirr');
  const [transactionRef, setTransactionRef] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('+251 9');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<ListingPayment | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Exact Account Details specified by user
  const TELEBIRR_DETAILS = {
    accountNumber: '0976886009',
    accountName: 'Shimelis Gizaw',
    provider: 'Telebirr (Ethio Telecom)',
    ussd: '*127#',
  };

  const CBE_DETAILS = {
    accountNumber: '1000750859619',
    accountName: 'Shimelis Gizaw Arado',
    provider: 'Commercial Bank of Ethiopia (CBE)',
    ussd: '*847#',
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard?.writeText?.(text);
    setIsCopied(type);
    setTimeout(() => setIsCopied(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!transactionRef.trim()) {
      setFormError('Please enter the Transaction ID / Reference Number from your transfer SMS or receipt.');
      return;
    }

    if (!receiptImage) {
      setFormError('Please upload a screenshot or photo of your transfer receipt for verification.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const payment: ListingPayment = {
        id: `pay-${Date.now()}`,
        listingId: `sub-${Date.now().toString().slice(-6)}`,
        propertyTitle: planName,
        landlordName: payerName.trim() || (paymentMethod === 'telebirr' ? 'Telebirr User' : 'CBE User'),
        landlordPhone: payerPhone,
        amountEtb,
        paymentMethod,
        transactionRef: transactionRef.trim(),
        status: 'Completed',
        paidAt: new Date().toLocaleString(),
        receiptImageUrl: receiptImage,
        receiptFileName: receiptFileName || 'receipt.jpg',
        planType: 'subscription_pro',
      };

      setCompletedPayment(payment);
      setIsSubmitting(false);
      onPaymentSuccess(payment);
    }, 1200);
  };

  const handleResetAndClose = () => {
    setCompletedPayment(null);
    setTransactionRef('');
    setReceiptImage(null);
    setReceiptFileName(null);
    setFormError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
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
                    ? 'የፕሮ እቅድ ምዝገባ ክፍያ (200 ብር)'
                    : language === 'om'
                    ? 'Kaffaltii Pilaanii Pro (ETB 200)'
                    : 'Subscription & Pro Plan Checkout (200 ETB)'}
                </h3>
                <p className="text-xs text-slate-300">
                  {language === 'am'
                    ? 'በቴሌብር ወይም በኢትዮጵያ ንግድ ባንክ (CBE) በቀጥታ ይክፈሉ'
                    : language === 'om'
                    ? 'Telebirr ykn Baankii Daldala Itoophiyaan (CBE) kaffalaa'
                    : 'Direct Manual Transfer via Telebirr or Commercial Bank of Ethiopia (CBE)'}
                </p>
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

        {/* Content Body */}
        <div className="overflow-y-auto p-6">
          {completedPayment ? (
            /* Success & Verified Official Receipt View */
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">
                  {language === 'am'
                    ? 'ክፍያዎ በተሳካ ሁኔታ ተረጋግጧል!'
                    : language === 'om'
                    ? 'Kaffaltiin Keessan Mirkanaa\'eera!'
                    : 'Payment Successfully Verified!'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {language === 'am'
                    ? 'የ 200 ብር የፕሮ እቅድ ክፍያ ተቀብለናል። አሁን ተጨማሪ ቤቶችን ያለገደብ መለጠፍ ይችላሉ።'
                    : language === 'om'
                    ? 'Kaffaltiin ETB 200 qaqqabeera. Amma manneen dabalataa daangaa malee maxxansuu dandeessu.'
                    : 'Your 200 ETB Pro Plan transfer was received and verified. Pro landlord privileges are now unlocked.'}
                </p>
              </div>

              {/* Official Transaction Receipt */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600 font-sans font-bold flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-700" />
                    Rentora Official Receipt
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    200 ETB VERIFIED
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-bold text-slate-900">{planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-bold text-slate-900">{completedPayment.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {completedPayment.paymentMethod === 'telebirr'
                      ? 'Telebirr (0976886009)'
                      : 'CBE (1000750859619)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient Name:</span>
                  <span className="font-bold text-slate-900">
                    {completedPayment.paymentMethod === 'telebirr'
                      ? 'Shimelis Gizaw'
                      : 'Shimelis Gizaw Arado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payer Name:</span>
                  <span className="text-slate-800">{completedPayment.landlordName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-800">{completedPayment.paidAt}</span>
                </div>

                {completedPayment.receiptImageUrl && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-1">Attached Receipt Screenshot:</span>
                    <img
                      src={completedPayment.receiptImageUrl}
                      alt="Receipt preview"
                      className="w-full max-h-36 object-contain rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                {language === 'am' ? 'ይቀጥሉ' : 'Continue with Pro Access'}
              </button>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Order Summary Box */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-900 font-bold block">{planName}</span>
                  <span className="text-[11px] text-emerald-700">
                    Unlock 3rd+ listings, Verified Landlord badge, Google Sheets live sync
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Amount Due</span>
                  <span className="text-xl font-black text-emerald-800">{amountEtb} ETB</span>
                </div>
              </div>

              {/* Payment Gateway Toggle: Telebirr vs CBE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  1. {language === 'am' ? 'የመክፈያ ዘዴ ይምረጡ' : language === 'om' ? 'Mala Kaffaltii Filadhaa' : 'Select Transfer Method'}
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Telebirr Tab */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('telebirr')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'telebirr'
                        ? 'border-emerald-700 bg-emerald-50/90 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xs shrink-0">
                        tb
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">Telebirr</span>
                        <span className="text-[10px] text-slate-500">ኢትዮ ቴሌኮም</span>
                      </div>
                    </div>
                  </button>

                  {/* CBE Tab */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cbe_birr')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'cbe_birr'
                        ? 'border-purple-700 bg-purple-50/90 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-800 text-white flex items-center justify-center font-black text-xs shrink-0">
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

              {/* Exact Account Details Box */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                    {paymentMethod === 'telebirr' ? 'Telebirr Payment Account' : 'CBE Bank Account Details'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Manual Transfer
                  </span>
                </div>

                {paymentMethod === 'telebirr' ? (
                  /* Telebirr Details */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Telebirr Mobile Number</span>
                        <span className="text-sm font-black text-slate-900 font-mono tracking-wider">
                          {TELEBIRR_DETAILS.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(TELEBIRR_DETAILS.accountNumber, 'tb_num')}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        {isCopied === 'tb_num' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Registered Account Name</span>
                        <span className="text-xs font-bold text-slate-900">
                          {TELEBIRR_DETAILS.accountName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(TELEBIRR_DETAILS.accountName, 'tb_name')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {isCopied === 'tb_name' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      💡 <b>Instructions:</b> Dial <b>*127#</b> or open the Telebirr app. Send <b>200 ETB</b> to{' '}
                      <b>0976886009 (Shimelis Gizaw)</b>. Copy the transaction reference ID from the confirmation SMS and upload your screenshot below.
                    </p>
                  </div>
                ) : (
                  /* CBE Details */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block">CBE Account Number</span>
                        <span className="text-sm font-black text-slate-900 font-mono tracking-wider">
                          {CBE_DETAILS.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(CBE_DETAILS.accountNumber, 'cbe_acc')}
                        className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        {isCopied === 'cbe_acc' ? (
                          <>
                            <Check className="w-3 h-3 text-purple-700" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Account Holder Name</span>
                        <span className="text-xs font-bold text-slate-900">
                          {CBE_DETAILS.accountName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(CBE_DETAILS.accountName, 'cbe_name')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {isCopied === 'cbe_name' ? (
                          <>
                            <Check className="w-3 h-3 text-purple-700" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      💡 <b>Instructions:</b> Transfer <b>200 ETB</b> to Account <b>1000750859619 (Shimelis Gizaw Arado)</b> via CBE Mobile Banking, CBE Birr (*847#), or any branch. Enter the transaction reference and upload receipt below.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Input: Reference & Receipt Upload */}
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
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Found in your transfer confirmation SMS or banking receipt
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Your Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+251 9..."
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Landlord Name"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Receipt Screenshot Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    3. Upload Transfer Receipt / Screenshot <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {receiptImage ? (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 truncate max-w-[240px]">
                          <FileImage className="w-4 h-4 text-emerald-700 shrink-0" />
                          {receiptFileName || 'receipt_screenshot.png'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptImage(null);
                            setReceiptFileName(null);
                          }}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="relative aspect-16/9 max-h-36 w-full rounded-xl overflow-hidden bg-white border border-emerald-200">
                        <img
                          src={receiptImage}
                          alt="Uploaded receipt"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-5 border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-2xl text-center cursor-pointer transition-all space-y-1.5"
                    >
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="text-xs font-bold text-slate-800 block">
                        Click or drag transfer screenshot here
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Supports PNG, JPG, JPEG up to 5MB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    paymentMethod === 'telebirr'
                      ? 'bg-emerald-800 hover:bg-emerald-900'
                      : 'bg-purple-800 hover:bg-purple-900'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Receipt & Transfer Details...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Verify & Submit {amountEtb} ETB Payment
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified by Rentora Ethiopian Payment Processing Team</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
