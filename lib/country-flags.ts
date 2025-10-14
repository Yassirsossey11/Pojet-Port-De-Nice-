// Mapping des pays vers leurs codes ISO 2 lettres pour les drapeaux
const countryFlags: Record<string, string> = {
  // Europe
  'France': 'fr',
  'Italie': 'it',
  'Italy': 'it',
  'Espagne': 'es',
  'Spain': 'es',
  'Monaco': 'mc',
  'Royaume-Uni': 'gb',
  'United Kingdom': 'gb',
  'UK': 'gb',
  'Grèce': 'gr',
  'Greece': 'gr',
  'Allemagne': 'de',
  'Germany': 'de',
  'Portugal': 'pt',
  'Pays-Bas': 'nl',
  'Netherlands': 'nl',
  'Belgique': 'be',
  'Belgium': 'be',
  'Suisse': 'ch',
  'Switzerland': 'ch',
  'Croatie': 'hr',
  'Croatia': 'hr',
  'Malte': 'mt',
  'Malta': 'mt',
  'Autriche': 'at',
  'Austria': 'at',
  'Irlande': 'ie',
  'Ireland': 'ie',
  'Norvège': 'no',
  'Norway': 'no',
  'Suède': 'se',
  'Sweden': 'se',
  'Danemark': 'dk',
  'Denmark': 'dk',
  
  // Amérique
  'États-Unis': 'us',
  'USA': 'us',
  'United States': 'us',
  'Canada': 'ca',
  'Brésil': 'br',
  'Brazil': 'br',
  'Mexique': 'mx',
  'Mexico': 'mx',
  'Argentine': 'ar',
  'Argentina': 'ar',
  
  // Asie
  'Japon': 'jp',
  'Japan': 'jp',
  'Chine': 'cn',
  'China': 'cn',
  'Corée du Sud': 'kr',
  'South Korea': 'kr',
  'Singapour': 'sg',
  'Singapore': 'sg',
  'Émirats Arabes Unis': 'ae',
  'UAE': 'ae',
  'Dubai': 'ae',
  
  // Océanie
  'Australie': 'au',
  'Australia': 'au',
  'Nouvelle-Zélande': 'nz',
  'New Zealand': 'nz',
  
  // Afrique
  'Maroc': 'ma',
  'Morocco': 'ma',
  'Tunisie': 'tn',
  'Tunisia': 'tn',
  'Algérie': 'dz',
  'Algeria': 'dz',
  'Afrique du Sud': 'za',
  'South Africa': 'za',
}

/**
 * Retourne le code ISO du pays pour afficher le drapeau SVG
 * @param country Nom du pays
 * @returns Code ISO 2 lettres (ex: 'fr', 'it', 'us') ou null
 */
export function getCountryCode(country: string | null | undefined): string | null {
  if (!country) return null
  
  // Recherche exacte
  if (countryFlags[country]) {
    return countryFlags[country]
  }
  
  // Recherche insensible à la casse
  const countryLower = country.toLowerCase()
  for (const [key, value] of Object.entries(countryFlags)) {
    if (key.toLowerCase() === countryLower) {
      return value
    }
  }
  
  // Recherche partielle (si le nom contient le pays)
  for (const [key, value] of Object.entries(countryFlags)) {
    if (countryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(countryLower)) {
      return value
    }
  }
  
  return null
}

/**
 * Retourne l'URL du drapeau SVG coloré
 * @param country Nom du pays
 * @returns URL du drapeau SVG depuis flagcdn.com
 */
export function getCountryFlagUrl(country: string | null | undefined): string | null {
  const code = getCountryCode(country)
  if (!code) return null
  
  return `https://flagcdn.com/w80/${code}.png`
}

/**
 * Composant React pour afficher le drapeau
 * Utilisé pour avoir un fallback si l'image ne charge pas
 */
export function getCountryFlag(country: string | null | undefined): string {
  const code = getCountryCode(country)
  if (!code) return '🌍'
  
  // Retourner l'emoji comme fallback
  const emojiMap: Record<string, string> = {
    'fr': '🇫🇷', 'it': '🇮🇹', 'es': '🇪🇸', 'mc': '🇲🇨', 'gb': '🇬🇧',
    'gr': '🇬🇷', 'de': '🇩🇪', 'pt': '🇵🇹', 'nl': '🇳🇱', 'be': '🇧🇪',
    'us': '🇺🇸', 'ca': '🇨🇦', 'jp': '🇯🇵', 'au': '🇦🇺', 'ma': '🇲🇦'
  }
  
  return emojiMap[code] || '🌍'
}

