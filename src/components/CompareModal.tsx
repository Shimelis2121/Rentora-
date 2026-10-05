import React from 'react';
import { X, Check, ArrowRight, Bed, Bath, Maximize2, DollarSign, Calendar } from 'lucide-react';
import { Apartment } from '../types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartments: Apartment[];
  onRemoveFromCompare: (id: string) => void;
  onSelectApartment: (apartment: Apartment) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  apartments,
  onRemoveFromCompare,
  onSelectApartment,
}) => {
  if (!isOpen || apartments.length === 0) return null;

  const minPrice = Math.min(...apartments.map((a) => a.price));
  const maxSqft = Math.max(...apartments.map((a) => a.sqft));
  const maxWalkScore = Math.max(...apartments.map((a) => a.walkScore));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Compare Apartments</h2>
            <p className="text-xs text-slate-500">
              Side-by-side analysis of your {apartments.length} selected residences
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {apartments.map((apt) => {
              const isLowestPrice = apt.price === minPrice;
              const isLargest = apt.sqft === maxSqft;
              const isHighestWalk = apt.walkScore === maxWalkScore;
              const pricePerSqft = Math.round(apt.price / (apt.sqft || 1));

              return (
                <div
                  key={apt.id}
                  className="border border-slate-200 rounded-3xl overflow-hidden flex flex-col bg-white shadow-xs relative"
                >
                  <button
                    onClick={() => onRemoveFromCompare(apt.id)}
                    className="absolute top-3 right-3 z-10 w-7 h-7 bg-white/90 hover:bg-white text-slate-600 rounded-full flex items-center justify-center shadow-md transition-all text-xs"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Image */}
                  <div className="aspect-16/10 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={apt.images[0]}
                      alt={apt.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Price row */}
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-black text-slate-900">
                            ${apt.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500">/mo</span>
                        </div>
                        {isLowestPrice && (
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                            Best Price
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">
                        {apt.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {apt.neighborhood}, {apt.city}
                      </p>

                      {/* Specs Matrix */}
                      <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Bedrooms</span>
                          <span className="font-bold text-slate-800">
                            {apt.bedrooms === 0 ? 'Studio' : `${apt.bedrooms} Bed`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Bathrooms</span>
                          <span className="font-bold text-slate-800">{apt.bathrooms} Bath</span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Square Footage</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            {apt.sqft.toLocaleString()} sqft
                            {isLargest && (
                              <span className="text-[10px] text-emerald-600 font-extrabold">
                                (Largest)
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Price / SqFt</span>
                          <span className="font-semibold text-slate-700">${pricePerSqft}/sqft</span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Security Deposit</span>
                          <span className="font-semibold text-slate-700">
                            ${apt.deposit.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Walk Score</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            {apt.walkScore}/100
                            {isHighestWalk && (
                              <span className="text-[10px] text-emerald-600 font-extrabold">
                                (Top)
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">Pet Policy</span>
                          <span className="font-medium text-slate-700 truncate max-w-[150px] text-right">
                            {apt.petPolicy}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-500">In-Unit Laundry</span>
                          <span className="font-bold text-slate-800">
                            {apt.inUnitLaundry ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Yes
                              </span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-1">
                          <span className="text-slate-500">Parking</span>
                          <span className="font-bold text-slate-800">
                            {apt.parking ? (
                              <span className="text-emerald-600 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Garage
                              </span>
                            ) : (
                              <span className="text-slate-400">Street only</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectApartment(apt);
                      }}
                      className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
