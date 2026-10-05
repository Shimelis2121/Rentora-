export interface EthiopianLocation {
  id: string;
  nameEn: string;
  nameAm: string;
  nameOm: string;
  level: 'region' | 'zone' | 'woreda';
  parentId?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const ETHIOPIA_BOUNDS: [[number, number], [number, number]] = [
  [3.4, 33.0],
  [14.9, 48.0],
];

export const DEFAULT_ETHIOPIA_CENTER: [number, number] = [9.0108, 38.7618]; // Addis Ababa Center

export const ETHIOPIAN_REGIONS: EthiopianLocation[] = [
  {
    id: 'reg-aa',
    nameEn: 'Addis Ababa',
    nameAm: 'አዲስ አበባ',
    nameOm: 'Finfinnee',
    level: 'region',
    coordinates: { lat: 9.0108, lng: 38.7618 },
  },
  {
    id: 'reg-oromia',
    nameEn: 'Oromia',
    nameAm: 'ኦሮሚያ',
    nameOm: 'Oromiyaa',
    level: 'region',
    coordinates: { lat: 8.54, lng: 39.27 },
  },
  {
    id: 'reg-amhara',
    nameEn: 'Amhara',
    nameAm: 'አማራ',
    nameOm: 'Amaaraa',
    level: 'region',
    coordinates: { lat: 11.6, lng: 37.38 },
  },
  {
    id: 'reg-sidama',
    nameEn: 'Sidama',
    nameAm: 'ሲዳማ',
    nameOm: 'Sidaamaa',
    level: 'region',
    coordinates: { lat: 7.05, lng: 38.47 },
  },
  {
    id: 'reg-central',
    nameEn: 'Central Ethiopia',
    nameAm: 'ማዕከላዊ ኢትዮጵያ',
    nameOm: 'Itoophiyaa Gidduugaleessaa',
    level: 'region',
    coordinates: { lat: 8.28, lng: 37.78 },
  },
  {
    id: 'reg-southwest',
    nameEn: 'Southwest Ethiopia',
    nameAm: 'ደቡብ ምዕራብ ኢትዮጵያ',
    nameOm: 'Itoophiyaa Kibba-Dhihaa',
    level: 'region',
    coordinates: { lat: 7.2, lng: 35.43 },
  },
  {
    id: 'reg-diredawa',
    nameEn: 'Dire Dawa',
    nameAm: 'ድሬዳዋ',
    nameOm: 'Dirree Dhawaa',
    level: 'region',
    coordinates: { lat: 9.59, lng: 41.86 },
  },
  {
    id: 'reg-tigray',
    nameEn: 'Tigray',
    nameAm: 'ትግራይ',
    nameOm: 'Tigraay',
    level: 'region',
    coordinates: { lat: 13.5, lng: 39.47 },
  },
  {
    id: 'reg-somali',
    nameEn: 'Somali',
    nameAm: 'ሶማሌ',
    nameOm: 'Somaalee',
    level: 'region',
    coordinates: { lat: 9.35, lng: 42.8 },
  },
  {
    id: 'reg-south',
    nameEn: 'South Ethiopia',
    nameAm: 'ደቡብ ኢትዮጵያ',
    nameOm: 'Itoophiyaa Kibbaa',
    level: 'region',
    coordinates: { lat: 6.03, lng: 37.55 },
  },
  {
    id: 'reg-harari',
    nameEn: 'Harari',
    nameAm: 'ሐረሪ',
    nameOm: 'Hararii',
    level: 'region',
    coordinates: { lat: 9.31, lng: 42.12 },
  },
];

export const ETHIOPIAN_ZONES: EthiopianLocation[] = [
  // Addis Ababa Sub-Cities (ክፍለ ከተማ)
  {
    id: 'zone-bole',
    parentId: 'reg-aa',
    nameEn: 'Bole Sub-City',
    nameAm: 'ቦሌ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Boolee',
    level: 'zone',
    coordinates: { lat: 8.995, lng: 38.788 },
  },
  {
    id: 'zone-yeka',
    parentId: 'reg-aa',
    nameEn: 'Yeka Sub-City',
    nameAm: 'የካ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Yakkkaa',
    level: 'zone',
    coordinates: { lat: 9.035, lng: 38.815 },
  },
  {
    id: 'zone-kirkos',
    parentId: 'reg-aa',
    nameEn: 'Kirkos Sub-City',
    nameAm: 'ቂርቆስ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Qirqoos',
    level: 'zone',
    coordinates: { lat: 9.012, lng: 38.763 },
  },
  {
    id: 'zone-nifas-silk',
    parentId: 'reg-aa',
    nameEn: 'Nifas Silk-Lafto Sub-City',
    nameAm: 'ንፋስ ስልክ ላፍቶ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Nifaas Silki Laaftoo',
    level: 'zone',
    coordinates: { lat: 8.97, lng: 38.73 },
  },
  {
    id: 'zone-arada',
    parentId: 'reg-aa',
    nameEn: 'Arada Sub-City',
    nameAm: 'አራዳ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Araadaa',
    level: 'zone',
    coordinates: { lat: 9.036, lng: 38.752 },
  },
  {
    id: 'zone-lideta',
    parentId: 'reg-aa',
    nameEn: 'Lideta Sub-City',
    nameAm: 'ልደታ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Lidataa',
    level: 'zone',
    coordinates: { lat: 9.011, lng: 38.736 },
  },
  {
    id: 'zone-kolfe',
    parentId: 'reg-aa',
    nameEn: 'Kolfe Keranio Sub-City',
    nameAm: 'ኮልፌ ቀራንዮ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Kolfee Qaraaniyoo',
    level: 'zone',
    coordinates: { lat: 9.025, lng: 38.71 },
  },
  {
    id: 'zone-gullele',
    parentId: 'reg-aa',
    nameEn: 'Gullele Sub-City',
    nameAm: 'ጉለሌ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Gullellee',
    level: 'zone',
    coordinates: { lat: 9.065, lng: 38.735 },
  },
  {
    id: 'zone-lemi-kura',
    parentId: 'reg-aa',
    nameEn: 'Lemi Kura Sub-City',
    nameAm: 'ለሚ ኩራ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Lammii Kuuraa',
    level: 'zone',
    coordinates: { lat: 9.02, lng: 38.86 },
  },
  {
    id: 'zone-akaky',
    parentId: 'reg-aa',
    nameEn: 'Akaky Kaliti Sub-City',
    nameAm: 'አቃቂ ቃሊቲ ክፍለ ከተማ',
    nameOm: 'Kifla Magaalaa Aqaaqii Qaallittii',
    level: 'zone',
    coordinates: { lat: 8.91, lng: 38.77 },
  },

  // Oromia Zones & Cities
  {
    id: 'zone-bale',
    parentId: 'reg-oromia',
    nameEn: 'Bale Zone (Bale Robe)',
    nameAm: 'ባሌ ዞን (ባሌ ሮቤ)',
    nameOm: 'Godina Baalee (Roobee)',
    level: 'zone',
    coordinates: { lat: 7.12, lng: 40.0 },
  },
  {
    id: 'zone-east-bale',
    parentId: 'reg-oromia',
    nameEn: 'East Bale Zone (Gindhir / Ginnir)',
    nameAm: 'ምስራቅ ባሌ ዞን (ጊንዲር)',
    nameOm: 'Godina Baalee Bahaa (Ginniir)',
    level: 'zone',
    coordinates: { lat: 7.14, lng: 40.71 },
  },
  {
    id: 'zone-arsi',
    parentId: 'reg-oromia',
    nameEn: 'Arsi Zone (Asella & Arsi Robe)',
    nameAm: 'አርሲ ዞን (አሰላ እና አርሲ ሮቤ)',
    nameOm: 'Godina Arsii (Asallaa fi Roobee)',
    level: 'zone',
    coordinates: { lat: 7.95, lng: 39.13 },
  },
  {
    id: 'zone-sheger',
    parentId: 'reg-oromia',
    nameEn: 'Sheger City (Finfinnee Surrounding)',
    nameAm: 'ሸገር ከተማ / የፊንፊኔ ዙሪያ',
    nameOm: 'Magaalaa Shaggar',
    level: 'zone',
    coordinates: { lat: 9.04, lng: 38.68 },
  },
  {
    id: 'zone-adama',
    parentId: 'reg-oromia',
    nameEn: 'Adama Special Zone',
    nameAm: 'አዳማ ልዩ ዞን',
    nameOm: 'Godina Addaa Adaamaa',
    level: 'zone',
    coordinates: { lat: 8.54, lng: 39.27 },
  },
  {
    id: 'zone-bishoftu',
    parentId: 'reg-oromia',
    nameEn: 'Bishoftu (Debre Zeyit)',
    nameAm: 'ቢሾፍቱ (ደብረ ዘይት)',
    nameOm: 'Bishooftuu',
    level: 'zone',
    coordinates: { lat: 8.75, lng: 38.98 },
  },
  {
    id: 'zone-jimma',
    parentId: 'reg-oromia',
    nameEn: 'Jimma City Zone',
    nameAm: 'ጅማ ከተማ ዞን',
    nameOm: 'Magaalaa Jimmaa',
    level: 'zone',
    coordinates: { lat: 7.67, lng: 36.83 },
  },
  {
    id: 'zone-shashemene',
    parentId: 'reg-oromia',
    nameEn: 'West Arsi / Shashemene',
    nameAm: 'ሻሸመኔ / ምዕራብ አርሲ',
    nameOm: 'Shaashamannee',
    level: 'zone',
    coordinates: { lat: 7.2, lng: 38.6 },
  },

  // Central Ethiopia
  {
    id: 'zone-gurage',
    parentId: 'reg-central',
    nameEn: 'Gurage Zone (Wolkite & Butajira)',
    nameAm: 'ጉራጌ ዞን (ወልቂጤ እና ቡታጅራ)',
    nameOm: 'Godina Guraagee (Walqixxee)',
    level: 'zone',
    coordinates: { lat: 8.28, lng: 37.78 },
  },

  // Southwest Ethiopia
  {
    id: 'zone-sheka',
    parentId: 'reg-southwest',
    nameEn: 'Sheka Zone (Tepi Town)',
    nameAm: 'ሼካ ዞን (ቴፒ ከተማ)',
    nameOm: 'Godina Sheekaa (Xeeppii)',
    level: 'zone',
    coordinates: { lat: 7.2, lng: 35.43 },
  },

  // Sidama
  {
    id: 'zone-hawassa',
    parentId: 'reg-sidama',
    nameEn: 'Hawassa City Administration',
    nameAm: 'ሐዋሳ ከተማ አስተዳደር',
    nameOm: 'Magaalaa Hawaasaa',
    level: 'zone',
    coordinates: { lat: 7.05, lng: 38.47 },
  },
  {
    id: 'zone-sidama-provincial',
    parentId: 'reg-sidama',
    nameEn: 'Sidama Zone (Yirgalem & Aleta Wondo)',
    nameAm: 'ሲዳማ ዞን (ይርጋለም እና አለታ ወንዶ)',
    nameOm: 'Godina Sidaamaa (Yirgaalam fi Alatta Wandoo)',
    level: 'zone',
    coordinates: { lat: 6.75, lng: 38.42 },
  },

  // Amhara Zones
  {
    id: 'zone-bahirdar',
    parentId: 'reg-amhara',
    nameEn: 'Bahir Dar Special Zone',
    nameAm: 'ባሕር ዳር ልዩ ዞን',
    nameOm: 'Godina Addaa Baahir Daar',
    level: 'zone',
    coordinates: { lat: 11.59, lng: 37.39 },
  },
  {
    id: 'zone-gondar',
    parentId: 'reg-amhara',
    nameEn: 'Gondar City Zone',
    nameAm: 'ጎንደር ከተማ ዞን',
    nameOm: 'Magaalaa Goondar',
    level: 'zone',
    coordinates: { lat: 12.6, lng: 37.46 },
  },
  {
    id: 'zone-debrebirhan',
    parentId: 'reg-amhara',
    nameEn: 'Debre Birhan Zone',
    nameAm: 'ደብረ ብርሃን ዞን',
    nameOm: 'Magaalaa Dabra Birhaan',
    level: 'zone',
    coordinates: { lat: 9.68, lng: 39.53 },
  },

  // Dire Dawa
  {
    id: 'zone-diredawa-city',
    parentId: 'reg-diredawa',
    nameEn: 'Dire Dawa Urban Admin',
    nameAm: 'ድሬዳዋ ከተማ አስተዳደር',
    nameOm: 'Bulchiinsa Magaalaa Dirree Dhawaa',
    level: 'zone',
    coordinates: { lat: 9.59, lng: 41.86 },
  },
];

export const ETHIOPIAN_WOREDAS: EthiopianLocation[] = [
  // Bale Robe
  {
    id: 'wor-bale-robe',
    parentId: 'zone-bale',
    nameEn: 'Bale Robe Town (Magaalaa Roobee)',
    nameAm: 'ባሌ ሮቤ ከተማ',
    nameOm: 'Magaalaa Baale Roobee',
    level: 'woreda',
    coordinates: { lat: 7.12, lng: 40.0 },
  },
  {
    id: 'wor-bale-sinana',
    parentId: 'zone-bale',
    nameEn: 'Sinana / Robe Suburb',
    nameAm: 'ሲናና / ሮቤ ዙሪያ',
    nameOm: 'Aanaa Sinaan (Roobee)',
    level: 'woreda',
    coordinates: { lat: 7.08, lng: 39.95 },
  },

  // Arsi Robe & Arsi Asella
  {
    id: 'wor-arsi-asella',
    parentId: 'zone-arsi',
    nameEn: 'Arsi Asella City (Magaalaa Asallaa)',
    nameAm: 'አርሲ አሰላ ከተማ',
    nameOm: 'Magaalaa Asallaa (Arsii)',
    level: 'woreda',
    coordinates: { lat: 7.95, lng: 39.13 },
  },
  {
    id: 'wor-arsi-robe',
    parentId: 'zone-arsi',
    nameEn: 'Arsi Robe (Robe Dida\'a)',
    nameAm: 'አርሲ ሮቤ (ሮቤ ዲዳ)',
    nameOm: 'Roobee Dida\'aa (Arsii)',
    level: 'woreda',
    coordinates: { lat: 7.87, lng: 39.63 },
  },

  // Bale Gindhir (Ginnir)
  {
    id: 'wor-bale-gindhir',
    parentId: 'zone-east-bale',
    nameEn: 'Bale Gindhir (Ginnir Town)',
    nameAm: 'ባሌ ጊንዲር (ጊኒር ከተማ)',
    nameOm: 'Magaalaa Ginniir (Baalee)',
    level: 'woreda',
    coordinates: { lat: 7.14, lng: 40.71 },
  },

  // Wolkite (Gurage)
  {
    id: 'wor-gurage-wolkite',
    parentId: 'zone-gurage',
    nameEn: 'Wolkite City (ወልቂጤ)',
    nameAm: 'ወልቂጤ ከተማ (ጉራጌ)',
    nameOm: 'Magaalaa Walqixxee',
    level: 'woreda',
    coordinates: { lat: 8.28, lng: 37.78 },
  },
  {
    id: 'wor-gurage-butajira',
    parentId: 'zone-gurage',
    nameEn: 'Butajira Town (ቡታጅራ)',
    nameAm: 'ቡታጅራ ከተማ',
    nameOm: 'Magaalaa Butaajiraa',
    level: 'woreda',
    coordinates: { lat: 8.12, lng: 38.37 },
  },

  // Tepi (Sheka / Southwest)
  {
    id: 'wor-sheka-tepi',
    parentId: 'zone-sheka',
    nameEn: 'Tepi Town (ቴፒ ከተማ)',
    nameAm: 'ቴፒ ከተማ (ሼካ)',
    nameOm: 'Magaalaa Xeeppii (Sheekaa)',
    level: 'woreda',
    coordinates: { lat: 7.2, lng: 35.43 },
  },

  // Sidama (Hawassa, Yirgalem, Aleta Wondo)
  {
    id: 'wor-hawassa-hayk',
    parentId: 'zone-hawassa',
    nameEn: 'Hawassa Piazza & Lakeside',
    nameAm: 'ሐዋሳ ፒያሳ እና ሐይቅ ዳር',
    nameOm: 'Hawaasaa - Qarqara Haroo',
    level: 'woreda',
    coordinates: { lat: 7.055, lng: 38.465 },
  },
  {
    id: 'wor-hawassa-tabor',
    parentId: 'zone-hawassa',
    nameEn: 'Hawassa Tabor & Menhariya',
    nameAm: 'ሐዋሳ ታቦር እና መናኸሪያ',
    nameOm: 'Hawaasaa - Gaara Taabor',
    level: 'woreda',
    coordinates: { lat: 7.04, lng: 38.49 },
  },
  {
    id: 'wor-sidama-yirgalem',
    parentId: 'zone-sidama-provincial',
    nameEn: 'Yirgalem Town (Sidama)',
    nameAm: 'ይርጋለም ከተማ (ሲዳማ)',
    nameOm: 'Magaalaa Yirgaalam',
    level: 'woreda',
    coordinates: { lat: 6.75, lng: 38.42 },
  },
  {
    id: 'wor-sidama-aleta-wondo',
    parentId: 'zone-sidama-provincial',
    nameEn: 'Aleta Wondo (Sidama)',
    nameAm: 'አለታ ወንዶ (ሲዳማ)',
    nameOm: 'Magaalaa Alatta Wandoo',
    level: 'woreda',
    coordinates: { lat: 6.6, lng: 38.42 },
  },

  // Bole Sub-City Woredas / Neighborhoods
  {
    id: 'wor-bole-atlas',
    parentId: 'zone-bole',
    nameEn: 'Bole Atlas / Edna Mall (Woreda 01)',
    nameAm: 'ቦሌ አትላስ / ኤድና ሞል (ወረዳ 01)',
    nameOm: 'Boolee Atlaas (Woreda 01)',
    level: 'woreda',
    coordinates: { lat: 8.998, lng: 38.783 },
  },
  {
    id: 'wor-bole-medhanialem',
    parentId: 'zone-bole',
    nameEn: 'Bole Medhanialem (Woreda 02)',
    nameAm: 'ቦሌ መድኃኔዓለም (ወረዳ 02)',
    nameOm: 'Boolee Madhaaniyyaalem (Woreda 02)',
    level: 'woreda',
    coordinates: { lat: 8.995, lng: 38.789 },
  },
  {
    id: 'wor-bole-gerji',
    parentId: 'zone-bole',
    nameEn: 'Gerji / Sunshine (Woreda 05)',
    nameAm: 'ገርጂ / ሳንሻይን (ወረዳ 05)',
    nameOm: 'Garjii (Woreda 05)',
    level: 'woreda',
    coordinates: { lat: 9.0, lng: 38.81 },
  },
  {
    id: 'wor-bole-bulbula',
    parentId: 'zone-bole',
    nameEn: 'Bole Bulbula (Woreda 07)',
    nameAm: 'ቦሌ ቡልቡላ (ወረዳ 07)',
    nameOm: 'Boolee Bulbullaa (Woreda 07)',
    level: 'woreda',
    coordinates: { lat: 8.96, lng: 38.79 },
  },

  // Yeka Sub-City
  {
    id: 'wor-yeka-cmc',
    parentId: 'zone-yeka',
    nameEn: 'CMC / Tsehay Real Estate (Woreda 08)',
    nameAm: 'ሲኤምሲ / ፀሐይ ሪል ስቴት (ወረዳ 08)',
    nameOm: 'CMC (Woreda 08)',
    level: 'woreda',
    coordinates: { lat: 9.025, lng: 38.835 },
  },
  {
    id: 'wor-yeka-megenagna',
    parentId: 'zone-yeka',
    nameEn: 'Megenagna / Signal (Woreda 01)',
    nameAm: 'መገናኛ / ሲግናል (ወረዳ 01)',
    nameOm: 'Magannaanyaa (Woreda 01)',
    level: 'woreda',
    coordinates: { lat: 9.021, lng: 38.802 },
  },
  {
    id: 'wor-yeka-ayat',
    parentId: 'zone-yeka',
    nameEn: 'Ayat Zone 2 / Woreda 09',
    nameAm: 'አያት ዞን 2 (ወረዳ 09)',
    nameOm: 'Ayaat (Woreda 09)',
    level: 'woreda',
    coordinates: { lat: 9.028, lng: 38.865 },
  },

  // Kirkos Sub-City
  {
    id: 'wor-kirkos-kazanchis',
    parentId: 'zone-kirkos',
    nameEn: 'Kazanchis / UNECA (Woreda 01)',
    nameAm: 'ካዛንቺስ / ኢሲኤ (ወረዳ 01)',
    nameOm: 'Kaazaanchiis (Woreda 01)',
    level: 'woreda',
    coordinates: { lat: 9.017, lng: 38.767 },
  },
  {
    id: 'wor-kirkos-meskelflower',
    parentId: 'zone-kirkos',
    nameEn: 'Meskel Flower / Olympia (Woreda 02)',
    nameAm: 'መስቀል ፍላወር / ኦሎምፒያ (ወረዳ 02)',
    nameOm: 'Masqal Filaawor (Woreda 02)',
    level: 'woreda',
    coordinates: { lat: 9.001, lng: 38.761 },
  },

  // Nifas Silk-Lafto
  {
    id: 'wor-nifas-sarbet',
    parentId: 'zone-nifas-silk',
    nameEn: 'Sarbet / Vatican Embassy (Woreda 01)',
    nameAm: 'ሳርቤት / ቫቲካን ኤምባሲ (ወረዳ 01)',
    nameOm: 'Saarbeet (Woreda 01)',
    level: 'woreda',
    coordinates: { lat: 8.989, lng: 38.736 },
  },
  {
    id: 'wor-nifas-bisrate',
    parentId: 'zone-nifas-silk',
    nameEn: 'Bisrate Gabriel / Old Airport (Woreda 02)',
    nameAm: 'ብስራተ ገብርኤል / ኦልድ ኤርፖርት (ወረዳ 02)',
    nameOm: 'Bisaaraate Gabri\'eel (Woreda 02)',
    level: 'woreda',
    coordinates: { lat: 8.975, lng: 38.738 },
  },

  // Arada & Lideta
  {
    id: 'wor-arada-piazza',
    parentId: 'zone-arada',
    nameEn: 'Piazza / Churchill Ave (Woreda 01)',
    nameAm: 'ፒያሳ / ቸርችል ጎዳና (ወረዳ 01)',
    nameOm: 'Piyaasaa (Woreda 01)',
    level: 'woreda',
    coordinates: { lat: 9.034, lng: 38.751 },
  },
  {
    id: 'wor-lideta-torhayloch',
    parentId: 'zone-lideta',
    nameEn: 'Torhailoch / Mexico Square (Woreda 03)',
    nameAm: 'ጦር ኃይሎች / ሜክሲኮ አደባባይ (ወረዳ 03)',
    nameOm: 'Torhaayiloch / Meeksiikoo (Woreda 03)',
    level: 'woreda',
    coordinates: { lat: 9.01, lng: 38.725 },
  },

  // Sheger City Sub-cities (Oromia)
  {
    id: 'wor-sheger-burayu',
    parentId: 'zone-sheger',
    nameEn: 'Burayu Sub-City (Sheger)',
    nameAm: 'ቡራዩ ክፍለ ከተማ (ሸገር)',
    nameOm: 'Kifla Magaalaa Buraayyuu',
    level: 'woreda',
    coordinates: { lat: 9.06, lng: 38.65 },
  },
  {
    id: 'wor-sheger-koye',
    parentId: 'zone-sheger',
    nameEn: 'Koye Feche Sub-City (Sheger)',
    nameAm: 'ኮዬ ፈጬ ክፍለ ከተማ (ሸገር)',
    nameOm: 'Kifla Magaalaa Kooyyee Faccee',
    level: 'woreda',
    coordinates: { lat: 8.87, lng: 38.83 },
  },

  // Adama
  {
    id: 'wor-adama-bole',
    parentId: 'zone-adama',
    nameEn: 'Bole Sub-City (Adama)',
    nameAm: 'ቦሌ ክፍለ ከተማ (አዳማ)',
    nameOm: 'Kifla Magaalaa Boolee (Adaamaa)',
    level: 'woreda',
    coordinates: { lat: 8.55, lng: 39.27 },
  },

  // Bahir Dar
  {
    id: 'wor-bahirdar-tana',
    parentId: 'zone-bahirdar',
    nameEn: 'Tana View / Belay Zeleke (Bahir Dar)',
    nameAm: 'ጣና እይታ / በላይ ዘለቀ (ባሕር ዳር)',
    nameOm: 'Baahir Daar - Haroo Xaanaa',
    level: 'woreda',
    coordinates: { lat: 11.6, lng: 37.385 },
  },
];

// Helper to calculate Distance between coordinates in Kilometers (Haversine formula)
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Check if a coordinate is strictly inside Ethiopia bounding box
export const isInsideEthiopia = (lat: number, lng: number): boolean => {
  return lat >= 3.4 && lat <= 14.9 && lng >= 33.0 && lng <= 48.0;
};

/**
 * Robust Reverse Geocoding for Ethiopia
 * First attempts OpenStreetMap Nominatim reverse geocoding.
 * If offline, blocked, or timed out, accurately computes the nearest known
 * Ethiopian woreda, zone, and region using minimum geographic distance.
 */
export const reverseGeocodeEthiopia = async (
  lat: number,
  lng: number
): Promise<{
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  regionId?: string;
  zoneId?: string;
  woredaId?: string;
}> => {
  // 1. Try OpenStreetMap Nominatim with a short timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'RentoraEthiopia/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.street || addr.neighbourhood || addr.suburb || '';
        const town =
          addr.city || addr.town || addr.municipality || addr.village || addr.county || 'Ethiopia';
        const state = addr.state || addr.region || 'Ethiopia';

        const fullAddr = [street, town, state, 'Ethiopia']
          .filter(Boolean)
          .join(', ');

        // Find best matching internal woreda & zone
        const nearestWoreda = findNearestWoreda(lat, lng);

        return {
          address: fullAddr || data.display_name,
          neighborhood: street || nearestWoreda?.woreda.nameEn || town,
          city: town,
          state: state,
          regionId: nearestWoreda?.region?.id,
          zoneId: nearestWoreda?.zone?.id,
          woredaId: nearestWoreda?.woreda?.id,
        };
      }
    }
  } catch (err) {
    // Fall through to offline nearest Ethiopian location lookup
  }

  // 2. High-precision Offline Fallback using nearest Ethiopian administrative units
  const nearest = findNearestWoreda(lat, lng);
  if (nearest) {
    const { woreda, zone, region } = nearest;
    return {
      address: `${woreda.nameEn}, ${zone.nameEn}, ${region.nameEn}, Ethiopia`,
      neighborhood: woreda.nameEn,
      city: zone.nameEn,
      state: region.nameEn,
      regionId: region.id,
      zoneId: zone.id,
      woredaId: woreda.id,
    };
  }

  return {
    address: `Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E, Ethiopia`,
    neighborhood: 'Ethiopian Residence',
    city: 'Addis Ababa',
    state: 'Ethiopia',
    regionId: 'reg-aa',
    zoneId: 'zone-bole',
    woredaId: 'wor-bole-atlas',
  };
};

/**
 * Finds the nearest Ethiopian Woreda, Zone, and Region to given coordinates.
 */
export const findNearestWoreda = (
  lat: number,
  lng: number
): {
  woreda: EthiopianLocation;
  zone: EthiopianLocation;
  region: EthiopianLocation;
  distanceKm: number;
} | null => {
  let minDistance = Infinity;
  let bestWoreda: EthiopianLocation | null = null;

  for (const w of ETHIOPIAN_WOREDAS) {
    const dist = calculateDistanceKm(lat, lng, w.coordinates.lat, w.coordinates.lng);
    if (dist < minDistance) {
      minDistance = dist;
      bestWoreda = w;
    }
  }

  if (!bestWoreda) return null;

  const zone = ETHIOPIAN_ZONES.find((z) => z.id === bestWoreda?.parentId) || ETHIOPIAN_ZONES[0];
  const region = ETHIOPIAN_REGIONS.find((r) => r.id === zone.parentId) || ETHIOPIAN_REGIONS[0];

  return {
    woreda: bestWoreda,
    zone,
    region,
    distanceKm: minDistance,
  };
};
