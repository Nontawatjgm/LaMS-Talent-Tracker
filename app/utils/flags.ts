export const nationalityToIsoCode: Record<string, string> = {
  // Top 10
  "Argentina": "ar", "France": "fr", "Spain": "es", "England": "gb-eng", "Brazil": "br",
  "Belgium": "be", "Netherlands": "nl", "Portugal": "pt", "Colombia": "co", "Italy": "it",
  // 11-20
  "Uruguay": "uy", "Croatia": "hr", "Germany": "de", "Morocco": "ma", "Switzerland": "ch",
  "USA": "us", "Mexico": "mx", "Japan": "jp", "Senegal": "sn", "Iran": "ir",
  // 21-30
  "Denmark": "dk", "Austria": "at", "South Korea": "kr", "Australia": "au", "Ukraine": "ua",
  "Turkey": "tr", "Ecuador": "ec", "Poland": "pl", "Sweden": "se", "Wales": "gb-wls",
  // 31-40
  "Hungary": "hu", "Serbia": "rs", "Russia": "ru", "Peru": "pe", "Qatar": "qa",
  "Egypt": "eg", "Ivory Coast": "ci", "Nigeria": "ng", "Scotland": "gb-sct", "Chile": "cl",
  // 41-50
  "Tunisia": "tn", "Algeria": "dz", "Panama": "pa", "Mali": "ml", "Czech Republic": "cz",
  "Romania": "ro", "Norway": "no", "Slovakia": "sk", "Canada": "ca", "Cameroon": "cm",
  // Others common in La Masia
  "Guinea": "gn"
};

// Export an array of the names for the dropdown
export const topNationalities = Object.keys(nationalityToIsoCode).sort();

export function getFlagEmoji(nationality: string): string {
  return "🏳️"; // We now use FlagCDN, so we just return a fallback emoji for the db
}

export function getCountryCode(nationality: string): string | null {
  return nationalityToIsoCode[nationality] || null;
}
