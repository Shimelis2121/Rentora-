import { Apartment, RentalApplication } from '../types';

export interface CreatedSpreadsheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export const createRentoraSpreadsheet = async (
  accessToken: string,
  listings: Apartment[] = []
): Promise<CreatedSpreadsheetResponse> => {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const title = `Rentora Ethiopia - Properties & Applications (${dateStr})`;

  // 1. Create spreadsheet with dedicated sheets
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Listings' } },
        { properties: { title: 'Applications' } },
        { properties: { title: 'Fee Payments' } },
        { properties: { title: 'Lease Tracker' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create Google Spreadsheet (HTTP ${createRes.status})`
    );
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl =
    createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepopulate header rows and initial data
  const listingsValues = [
    [
      'Listing ID',
      'Property Title',
      'Address',
      'City',
      'Sub-City / Zone',
      'Rent (ETB/mo)',
      'Deposit (ETB)',
      'Beds',
      'Baths',
      'Area (m²)',
      'Listing Tier',
      'Status',
      'Latitude',
      'Longitude',
    ],
    ...listings.map((l) => [
      l.id,
      l.title,
      l.address,
      l.city,
      l.neighborhood,
      l.price,
      l.deposit,
      l.bedrooms === 0 ? 'Studio' : l.bedrooms,
      l.bathrooms,
      l.sqft,
      l.isPaidListing ? 'Paid (200 ETB)' : 'Free Tier',
      l.status,
      l.coordinates.lat,
      l.coordinates.lng,
    ]),
  ];

  const appHeaderValues = [
    [
      'Application ID',
      'Property Title',
      'Applicant Name',
      'Email',
      'Phone',
      'Monthly Income (ETB)',
      'Financial Tier',
      'Employer',
      'Occupation',
      'Move-In Date',
      'Occupants',
      'Has Pets',
      'Status',
      'Submitted At',
    ],
  ];

  const paymentsHeaderValues = [
    [
      'Payment ID',
      'Property Title',
      'Landlord Phone',
      'Amount (ETB)',
      'Gateway',
      'Transaction Ref',
      'Status',
      'Date & Time',
    ],
    [
      'PAY-ETH-01',
      'Kazanchis Diplomatic Suite',
      '+251 91 123 4567',
      '200',
      'Telebirr',
      'TB-9018237461',
      'Completed',
      '2026-10-04 14:30',
    ],
  ];

  const leaseHeaderValues = [
    [
      'Unit / Address',
      'Tenant Name',
      'Contact Phone',
      'Monthly Rent (ETB)',
      'Security Deposit (ETB)',
      'Lease Start',
      'Lease End',
      'Payment Status',
    ],
  ];

  // Batch update values
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: "'Listings'!A1:N",
            values: listingsValues,
          },
          {
            range: "'Applications'!A1:N",
            values: appHeaderValues,
          },
          {
            range: "'Fee Payments'!A1:H",
            values: paymentsHeaderValues,
          },
          {
            range: "'Lease Tracker'!A1:H",
            values: leaseHeaderValues,
          },
        ],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
};

export const appendApplicationToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  app: RentalApplication
) => {
  const row = [
    app.id,
    app.apartmentTitle,
    app.applicantName,
    app.applicantEmail,
    app.applicantPhone,
    app.monthlyIncome,
    app.creditScoreRange,
    app.currentEmployer,
    app.occupation,
    app.moveInDate,
    app.occupantsCount,
    app.hasPets ? 'Yes' : 'No',
    app.status,
    app.appliedAt,
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Applications'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to log application to Google Sheets');
  }

  return await res.json();
};

export const appendFeePaymentToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  payment: {
    id: string;
    propertyTitle: string;
    landlordPhone: string;
    amountEtb: number;
    paymentMethod: string;
    transactionRef: string;
    status: string;
    paidAt: string;
  }
) => {
  const row = [
    payment.id,
    payment.propertyTitle,
    payment.landlordPhone,
    payment.amountEtb,
    payment.paymentMethod,
    payment.transactionRef,
    payment.status,
    payment.paidAt,
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Fee Payments'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  return res.ok;
};

export const syncAllListingsToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  listings: Apartment[]
) => {
  const header = [
    'Listing ID',
    'Property Title',
    'Address',
    'City',
    'Sub-City / Zone',
    'Rent (ETB/mo)',
    'Deposit (ETB)',
    'Beds',
    'Baths',
    'Area (m²)',
    'Listing Tier',
    'Status',
    'Latitude',
    'Longitude',
  ];

  const rows = listings.map((l) => [
    l.id,
    l.title,
    l.address,
    l.city,
    l.neighborhood,
    l.price,
    l.deposit,
    l.bedrooms === 0 ? 'Studio' : l.bedrooms,
    l.bathrooms,
    l.sqft,
    l.isPaidListing ? 'Paid (200 ETB)' : 'Free Tier',
    l.status,
    l.coordinates.lat,
    l.coordinates.lng,
  ]);

  // First clear old data on Listings
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Listings'!A1:N100:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  ).catch(() => {});

  // Write fresh data
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Listings'!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: "'Listings'!A1",
        majorDimension: 'ROWS',
        values: [header, ...rows],
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to sync listings to Google Sheets');
  }

  return await res.json();
};

export const fetchSpreadsheetInfo = async (
  accessToken: string,
  spreadsheetId: string
) => {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        'Could not access the specified spreadsheet. Please verify permissions.'
    );
  }

  const data = await res.json();
  return {
    title: data.properties?.title || 'Rentora Spreadsheet',
    sheets: (data.sheets || []).map((s: any) => s.properties?.title as string),
    url:
      data.spreadsheetUrl ||
      `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
};

export const importListingsFromSheet = async (
  accessToken: string,
  spreadsheetId: string
): Promise<Apartment[]> => {
  const meta = await fetchSpreadsheetInfo(accessToken, spreadsheetId);
  const targetTab =
    meta.sheets.find((name: string) => name.toLowerCase().includes('listing')) ||
    meta.sheets[0] ||
    'Sheet1';

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${targetTab}'!A1:Z100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to read data from sheet tab: ' + targetTab);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];
  if (rows.length < 2) {
    throw new Error('Spreadsheet has no listing rows to import.');
  }

  const imported: Apartment[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row[1]) continue;

    const id = row[0] ? String(row[0]) : `imported-${Date.now()}-${i}`;
    const title = String(row[1] || 'Imported Apartment');
    const address = String(row[2] || 'Bole Road');
    const city = String(row[3] || 'Addis Ababa');
    const neighborhood = String(row[4] || 'Bole');
    const price = Number(String(row[5] || '').replace(/[^0-9.]/g, '')) || 35000;
    const deposit = Number(String(row[6] || '').replace(/[^0-9.]/g, '')) || price;
    const bedVal = String(row[7] || '1').toLowerCase();
    const bedrooms = bedVal.includes('studio') ? 0 : Number(bedVal.replace(/[^0-9.]/g, '')) || 1;
    const bathrooms = Number(String(row[8] || '1').replace(/[^0-9.]/g, '')) || 1;
    const sqft = Number(String(row[9] || '90').replace(/[^0-9.]/g, '')) || 90;
    const isPaidListing = String(row[10] || '').includes('Paid');
    const status = (String(row[11] || 'Available') as any) || 'Available';
    const lat = Number(row[12]) || 9.0108;
    const lng = Number(row[13]) || 38.7618;

    imported.push({
      id,
      title,
      description: `Spacious, well-appointed residence in ${neighborhood}, ${city}. Includes reliable backup utilities and secure parking.`,
      address,
      neighborhood,
      city,
      state: city,
      zip: '1000',
      price,
      deposit,
      bedrooms,
      bathrooms,
      sqft,
      availableDate: new Date().toISOString().split('T')[0],
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      ],
      propertyType: bedrooms === 0 ? 'Studio' : 'Apartment',
      petPolicy: 'Cats & Dogs Allowed',
      inUnitLaundry: true,
      parking: true,
      balcony: true,
      centralAC: false,
      furnished: false,
      amenities: [
        'Backup Generator',
        'Rotto Water Reservoir',
        '24/7 Security Guard',
        'Parking',
      ],
      landlord: {
        id: 'landlord-import',
        name: 'Property Manager',
        phone: '+251 91 234 5678',
        email: 'management@rentora.et',
        rating: 4.85,
        reviewsCount: 18,
        responseTime: '< 30 mins',
        verified: true,
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
      walkScore: 92,
      transitScore: 88,
      bikeScore: 85,
      coordinates: { lat, lng },
      status,
      isPaidListing,
    });
  }

  return imported;
};
