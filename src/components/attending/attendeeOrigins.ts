// Origin data for the "Who's Attending" hover infographic.
//
// These are the free-text "where are you joining from?" answers collected at
// registration. They're intentionally messy ("home is where the heart is",
// "Artanis", "Cyberspace"), so we normalize each line to a country + continent
// and bucket the unparseable / whimsical ones into a fun "Nostrverse" group.
//
// Kept as a local constant on purpose: this is display-only flavor for the
// page, not part of the attendee dataset (which is KV-only, never committed).

export const RAW_ORIGINS: string[] = [
  'Oslo',
  'Boston, MA, USA',
  'Austin / USA',
  'Vancouver, BC',
  'Copenhagen, Denmark',
  'Paris',
  'Germany',
  'Lagos / Nigeria',
  'India',
  'Boston USA',
  'Zurich / Switzerland',
  'home is where the heart is',
  'Fairfax, VA USA',
  'Costa Rica',
  'Frederick, Maryland',
  'Austin / US',
  'London',
  'UK',
  'Bloomington / USA',
  'Waterloo, Canada',
  'Valencia / Spain',
  'Austin / USA',
  'Illinois, USA',
  'Alphen aan den rijn, The Netherlands',
  'Las Vegas',
  'UK',
  'California, USA',
  'Hurley, NY, USA',
  'mid atlantic (France/USA)',
  'Helsinki / Finland',
  'Sneek',
  'BRUXELLES',
  'Brussels/Belgium',
  'Helsinki, Finland',
  'Brussels',
  'Miami Beach, USA',
  'Rotterdam / Netherlands',
  'Breda, Netherlands',
  'The netherlands',
  'Berlin, Germany',
  'Argentina',
  'Aberdeen, Scotland',
  'Noblesville, Indiana, USA',
  'Seattle, Washington (United States)',
  'Argentina',
  'Manchester, UK',
  '2668 npub st. dev city, nostrverse 408a5',
  'Istanbul, Turkey',
  'Mexico City, mexico',
  'Brussels',
  'Austin',
  'Italy',
  'Augsburg, Germany',
  'Artanis',
  'Argentina',
  'Boston, MA, USA',
  'Pennsylvania, USA',
  'California, United States',
  'Venezuela',
  'Seattle / United States',
  'San Francisco',
  'Minneapolis MN',
  'Riverdale Park Maryland USA',
  'Bar, Montenegro',
  'Brooklyn, NY, USA',
  'Sao Paulo / Brazil',
  'Houston Texas, USA',
  'US West',
  'Buenos Aires / Argentina',
  'Sweden',
  'Austin, Texas',
  'Dublin, Ireland',
  'Italy',
  'Cyberspace',
  'Frankfurt',
  'at the moment: Harare/Zimbabwe, in May: Vienna/Austria',
  'thailand',
  'Fort Lauderdale, USA',
  'Santiago / Chile',
  'Chile',
  'Ottawa, Ontario, Canada',
  'Argentina',
  'Italy',
  'Germany',
  'USA',
  'USA',
  'USA',
  'New Zealand',
  'New Zealand',
  'New Zealand',
  'stateless',
  // 6 participants who didn't share a location — they get the Nostrverse.
  'Nostrverse',
  'Nostrverse',
  'Nostrverse',
  'Nostrverse',
  'Nostrverse',
  'Nostrverse',
];

export type Continent =
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Asia'
  | 'Africa'
  | 'Oceania'
  | 'Nostrverse';

interface Country {
  name: string;
  flag: string;
  continent: Continent;
}

// Match a raw string to a country. Order matters: more specific tokens first.
const RULES: Array<{ test: RegExp; country: Country }> = [
  { test: /\b(usa|united states|us west|u\.s\.|, us$|\/ us$|\bus$)\b/i, country: { name: 'United States', flag: '🇺🇸', continent: 'North America' } },
  { test: /boston|austin|fairfax|frederick|bloomington|illinois|california|hurley|las vegas|miami|noblesville|seattle|pennsylvania|san francisco|minneapolis|riverdale|brooklyn|houston|fort lauderdale|maryland|\bny\b|\bva\b|\bmn\b/i, country: { name: 'United States', flag: '🇺🇸', continent: 'North America' } },
  { test: /scotland|england|\buk\b|london|manchester|aberdeen/i, country: { name: 'United Kingdom', flag: '🇬🇧', continent: 'Europe' } },
  { test: /netherlands|rotterdam|breda|alphen|sneek/i, country: { name: 'Netherlands', flag: '🇳🇱', continent: 'Europe' } },
  { test: /belgium|brussels|bruxelles/i, country: { name: 'Belgium', flag: '🇧🇪', continent: 'Europe' } },
  { test: /germany|berlin|augsburg|frankfurt/i, country: { name: 'Germany', flag: '🇩🇪', continent: 'Europe' } },
  { test: /argentina|buenos aires/i, country: { name: 'Argentina', flag: '🇦🇷', continent: 'South America' } },
  { test: /finland|helsinki/i, country: { name: 'Finland', flag: '🇫🇮', continent: 'Europe' } },
  { test: /canada|vancouver|waterloo|ottawa/i, country: { name: 'Canada', flag: '🇨🇦', continent: 'North America' } },
  { test: /\bchile\b|santiago/i, country: { name: 'Chile', flag: '🇨🇱', continent: 'South America' } },
  { test: /\bitaly\b/i, country: { name: 'Italy', flag: '🇮🇹', continent: 'Europe' } },
  { test: /norway|oslo/i, country: { name: 'Norway', flag: '🇳🇴', continent: 'Europe' } },
  { test: /denmark|copenhagen/i, country: { name: 'Denmark', flag: '🇩🇰', continent: 'Europe' } },
  { test: /france|paris/i, country: { name: 'France', flag: '🇫🇷', continent: 'Europe' } },
  { test: /nigeria|lagos/i, country: { name: 'Nigeria', flag: '🇳🇬', continent: 'Africa' } },
  { test: /\bindia\b/i, country: { name: 'India', flag: '🇮🇳', continent: 'Asia' } },
  { test: /switzerland|zurich/i, country: { name: 'Switzerland', flag: '🇨🇭', continent: 'Europe' } },
  { test: /costa rica/i, country: { name: 'Costa Rica', flag: '🇨🇷', continent: 'North America' } },
  { test: /spain|valencia/i, country: { name: 'Spain', flag: '🇪🇸', continent: 'Europe' } },
  { test: /turkey|istanbul/i, country: { name: 'Türkiye', flag: '🇹🇷', continent: 'Europe' } },
  { test: /mexico/i, country: { name: 'Mexico', flag: '🇲🇽', continent: 'North America' } },
  { test: /venezuela/i, country: { name: 'Venezuela', flag: '🇻🇪', continent: 'South America' } },
  { test: /montenegro/i, country: { name: 'Montenegro', flag: '🇲🇪', continent: 'Europe' } },
  { test: /brazil|sao paulo/i, country: { name: 'Brazil', flag: '🇧🇷', continent: 'South America' } },
  { test: /sweden/i, country: { name: 'Sweden', flag: '🇸🇪', continent: 'Europe' } },
  { test: /ireland|dublin/i, country: { name: 'Ireland', flag: '🇮🇪', continent: 'Europe' } },
  { test: /thailand/i, country: { name: 'Thailand', flag: '🇹🇭', continent: 'Asia' } },
  { test: /new zealand|aotearoa/i, country: { name: 'New Zealand', flag: '🇳🇿', continent: 'Oceania' } },
  // "in May: Vienna/Austria" — they'll be in Austria for the event window.
  { test: /austria|vienna/i, country: { name: 'Austria', flag: '🇦🇹', continent: 'Europe' } },
];

const NOSTRVERSE: Country = { name: 'The Nostrverse', flag: '🛰️', continent: 'Nostrverse' };

function classify(raw: string): Country {
  for (const { test, country } of RULES) {
    if (test.test(raw)) return country;
  }
  return NOSTRVERSE;
}

export interface CountryTally {
  name: string;
  flag: string;
  continent: Continent;
  count: number;
}

export interface OriginStats {
  total: number;
  countries: CountryTally[];
  byContinent: Array<{ continent: Continent; count: number }>;
  countryCount: number;
  continentCount: number;
  nostrverse: number;
}

const CONTINENT_ORDER: Continent[] = [
  'Europe',
  'North America',
  'South America',
  'Asia',
  'Africa',
  'Oceania',
  'Nostrverse',
];

export function computeOriginStats(): OriginStats {
  const byCountry = new Map<string, CountryTally>();

  for (const raw of RAW_ORIGINS) {
    const c = classify(raw);
    const existing = byCountry.get(c.name);
    if (existing) existing.count += 1;
    else byCountry.set(c.name, { ...c, count: 1 });
  }

  const countries = [...byCountry.values()].sort((a, b) => b.count - a.count);

  const continentMap = new Map<Continent, number>();
  for (const c of countries) {
    continentMap.set(c.continent, (continentMap.get(c.continent) ?? 0) + c.count);
  }
  const byContinent = CONTINENT_ORDER.filter((k) => continentMap.has(k)).map(
    (continent) => ({ continent, count: continentMap.get(continent)! }),
  );

  const realCountries = countries.filter((c) => c.continent !== 'Nostrverse');

  return {
    total: RAW_ORIGINS.length,
    countries,
    byContinent,
    countryCount: realCountries.length,
    continentCount: byContinent.filter((c) => c.continent !== 'Nostrverse').length,
    nostrverse: continentMap.get('Nostrverse') ?? 0,
  };
}
