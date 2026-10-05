import React, { useState } from 'react';
import { Mail, X, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Apartment } from '../types';

interface MessageLandlordModalProps {
  apartment: Apartment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MessageLandlordModal: React.FC<MessageLandlordModalProps> = ({
  apartment,
  isOpen,
  onClose,
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen || !apartment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !message) return;
    setIsSent(true);
  };

  const handleClose = () => {
    setIsSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={apartment.landlord.avatar}
                alt={apartment.landlord.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
              />
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <span>Message {apartment.landlord.name}</span>
                  {apartment.landlord.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </h3>
                <p className="text-[11px] text-slate-300">
                  Typically responds in {apartment.landlord.responseTime}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {isSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-slate-900">Message Delivered!</h4>
              <p className="text-xs text-slate-500">
                Landlord {apartment.landlord.name} will reply directly to <b>{senderEmail}</b>.
              </p>
              <button
                onClick={handleClose}
                className="w-full mt-2 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                Regarding: <b>{apartment.title}</b> (${apartment.price.toLocaleString()}/mo)
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taylor Smith"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="taylor@example.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Question</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Is parking included in the rent? Are flexible lease terms available?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message to Landlord</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
