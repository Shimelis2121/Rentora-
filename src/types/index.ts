export interface Landlord {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  reviewsCount: number;
  responseTime: string;
  verified: boolean;
  avatar: string;
}

export interface Apartment {
  id: string;
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  regionId?: string;
  zoneId?: string;
  woredaId?: string;
  distanceKm?: number;
  price: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  availableDate: string;
  images: string[];
  propertyType: 'Apartment' | 'Loft' | 'Studio' | 'Penthouse' | 'Townhome' | 'Condo';
  petPolicy: 'Cats & Dogs Allowed' | 'Cats Only' | 'Small Dogs Only' | 'No Pets';
  inUnitLaundry: boolean;
  parking: boolean;
  balcony: boolean;
  centralAC: boolean;
  furnished: boolean;
  amenities: string[];
  landlord: Landlord;
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  featured?: boolean;
  status: 'Available' | 'Pending' | 'Rented';
  isPaidListing?: boolean;
  paymentRef?: string;
}

export interface RentalApplication {
  id: string;
  apartmentId: string;
  apartmentTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  monthlyIncome: number;
  creditScoreRange: '750+ (Excellent)' | '700-749 (Good)' | '650-699 (Fair)' | 'Under 650';
  currentEmployer: string;
  occupation: string;
  moveInDate: string;
  occupantsCount: number;
  hasPets: boolean;
  petsDescription?: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Declined';
  appliedAt: string;
}

export interface InquiryMessage {
  id: string;
  apartmentId: string;
  apartmentTitle: string;
  senderRole: 'renter' | 'landlord';
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  text: string;
  timestamp: string;
}

export interface ListingPayment {
  id: string;
  listingId: string;
  propertyTitle: string;
  landlordName: string;
  landlordPhone: string;
  amountEtb: number; // 200
  paymentMethod: 'telebirr' | 'cbe_birr';
  transactionRef: string;
  status: 'Completed' | 'Pending' | 'Failed';
  paidAt: string;
  receiptImageUrl?: string;
  receiptFileName?: string;
  planType?: 'pro_listing' | 'subscription_pro';
}

export interface FilterState {
  searchQuery: string;
  neighborhood: string;
  regionId: string;
  zoneId: string;
  woredaId: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string; // 'all' | '0' | '1' | '2' | '3+'
  propertyType: string;
  petFriendlyOnly: boolean;
  inUnitLaundryOnly: boolean;
  parkingOnly: boolean;
  balconyOnly: boolean;
  centralACOnly: boolean;
  furnishedOnly: boolean;
  generatorOnly?: boolean;
  waterTankOnly?: boolean;
  securityGuardOnly?: boolean;
  elevatorOnly?: boolean;
  sortBy: 'recommended' | 'price-asc' | 'price-desc' | 'sqft-desc' | 'walkscore-desc' | 'distance';
  userLocation: { lat: number; lng: number } | null;
  maxDistanceKm?: number;
  selectedRadiusKm?: number; // e.g. 2, 5, 10, 25, 50 or undefined for any
  radiusCenter?: { lat: number; lng: number } | null;
}

export interface ConnectedSheetInfo {
  spreadsheetId: string;
  title: string;
  url: string;
  lastSyncedAt?: string;
}
