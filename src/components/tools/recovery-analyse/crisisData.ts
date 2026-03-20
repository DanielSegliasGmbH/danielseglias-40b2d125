/**
 * Historical crisis data for the global equity market.
 *
 * Sources:
 * - Dimson, Marsh & Staunton / UBS Global Investment Returns Yearbook (long-term)
 * - MSCI ACWI / MSCI World factsheets (modern era)
 *
 * Drawdown figures refer to the broad, market-cap-weighted world equity market
 * (nominal, price-based). Recovery = time from peak back to previous peak level.
 */

export interface CrisisEvent {
  id: string;
  name: string;
  peakYear: number;
  troughYear: number;
  recoveryYear: number;
  drawdownPct: number;          // negative, e.g. -84
  peakToTroughMonths: number;
  peakToRecoveryMonths: number;
  troughToRecoveryMonths: number;
  shortDescription: string;
  detailDescription: string;
  source: string;
}

export const CRISES: CrisisEvent[] = [
  {
    id: 'great-depression',
    name: 'Weltwirtschaftskrise',
    peakYear: 1929,
    troughYear: 1932,
    recoveryYear: 1936,
    drawdownPct: -84,
    peakToTroughMonths: 34,
    peakToRecoveryMonths: 84,
    troughToRecoveryMonths: 50,
    shortDescription: 'Der grösste Börsencrash der Geschichte.',
    detailDescription:
      'Der US-Aktienmarkt verlor rund 84% seines Werts. Weltweit dauerte es bis Mitte der 1930er-Jahre, bis breite Aktienmärkte ihr Vorkrisenniveau wieder erreichten.',
    source: 'DMS / UBS Global Investment Returns Yearbook',
  },
  {
    id: 'oil-crisis',
    name: 'Ölkrise / Stagflation',
    peakYear: 1973,
    troughYear: 1974,
    recoveryYear: 1977,
    drawdownPct: -48,
    peakToTroughMonths: 21,
    peakToRecoveryMonths: 46,
    troughToRecoveryMonths: 25,
    shortDescription: 'Ölembargo, Inflation und eine tiefe globale Rezession.',
    detailDescription:
      'Die Kombination aus Ölpreisschock, steigender Inflation und Rezession führte zu einem Einbruch von rund 48% am globalen Aktienmarkt.',
    source: 'DMS / UBS Global Investment Returns Yearbook',
  },
  {
    id: 'black-monday',
    name: 'Black Monday',
    peakYear: 1987,
    troughYear: 1987,
    recoveryYear: 1989,
    drawdownPct: -33,
    peakToTroughMonths: 2,
    peakToRecoveryMonths: 20,
    troughToRecoveryMonths: 18,
    shortDescription: 'Der grösste Tagesverlust aller Zeiten.',
    detailDescription:
      'Am 19. Oktober 1987 fiel der Dow Jones an einem einzigen Tag um über 22%. Globale Märkte fielen um rund 33% – erholten sich jedoch relativ schnell.',
    source: 'DMS / MSCI World Index',
  },
  {
    id: 'dotcom',
    name: 'Dotcom-Crash',
    peakYear: 2000,
    troughYear: 2002,
    recoveryYear: 2007,
    drawdownPct: -49,
    peakToTroughMonths: 31,
    peakToRecoveryMonths: 86,
    troughToRecoveryMonths: 55,
    shortDescription: 'Das Platzen der Technologie-Blase.',
    detailDescription:
      'Die euphorische Bewertung von Technologieunternehmen endete abrupt. Der MSCI World verlor rund 49% und brauchte bis 2007, um das alte Hoch zu erreichen.',
    source: 'MSCI World / MSCI ACWI',
  },
  {
    id: 'financial-crisis',
    name: 'Finanzkrise',
    peakYear: 2007,
    troughYear: 2009,
    recoveryYear: 2013,
    drawdownPct: -54,
    peakToTroughMonths: 17,
    peakToRecoveryMonths: 65,
    troughToRecoveryMonths: 48,
    shortDescription: 'Die globale Finanzkrise ausgelöst durch die US-Immobilienblase.',
    detailDescription:
      'Der Zusammenbruch von Lehman Brothers löste eine weltweite Krise aus. Der MSCI ACWI verlor über 54%, erholte sich aber bis Anfang 2013.',
    source: 'MSCI ACWI',
  },
  {
    id: 'corona',
    name: 'Corona-Crash',
    peakYear: 2020,
    troughYear: 2020,
    recoveryYear: 2020,
    drawdownPct: -34,
    peakToTroughMonths: 1,
    peakToRecoveryMonths: 5,
    troughToRecoveryMonths: 4,
    shortDescription: 'Der schnellste Crash und die schnellste Erholung der Geschichte.',
    detailDescription:
      'Die COVID-19-Pandemie führte im März 2020 zu einem Einbruch von rund 34% innerhalb weniger Wochen. Der Markt erholte sich in nur ca. 5 Monaten.',
    source: 'MSCI ACWI',
  },
];

/**
 * Synthetic long-term index series (annual, log-normal style).
 * Starting at 100 in 1900, reflecting approximate global equity
 * total-market performance with major drawdowns embedded.
 *
 * This is NOT exact daily data but a stylised annual reconstruction
 * for visualisation purposes, consistent with DMS/MSCI data.
 */
export function generateLongTermSeries(): { year: number; value: number }[] {
  // Annual values: start 100 in 1900, grow ~7% nominal long-run
  // with drawdowns matching historical crises.
  const base = 100;
  const avgGrowth = 0.07;
  const points: { year: number; value: number }[] = [];

  // Known drawdown years with approximate peak-relative multipliers
  const drawdownMap: Record<number, number> = {
    // Great Depression
    1929: 0.00, 1930: -0.25, 1931: -0.55, 1932: -0.84, 1933: -0.60, 1934: -0.45, 1935: -0.25, 1936: 0.00,
    // Oil crisis
    1973: 0.00, 1974: -0.48, 1975: -0.25, 1976: -0.10, 1977: 0.00,
    // Black Monday
    1987: -0.33, 1988: -0.10, 1989: 0.00,
    // Dotcom
    2000: 0.00, 2001: -0.20, 2002: -0.49, 2003: -0.30, 2004: -0.20, 2005: -0.10, 2006: -0.05, 2007: 0.00,
    // Financial crisis (from 2007 peak)
    2008: -0.40, 2009: -0.54, 2010: -0.30, 2011: -0.25, 2012: -0.10, 2013: 0.00,
    // Corona
    2020: -0.15, // annual net (crash + recovery in same year)
  };

  let value = base;
  for (let y = 1900; y <= 2025; y++) {
    // Check if a crisis affects this year
    const crisisEffect = drawdownMap[y];
    if (crisisEffect !== undefined) {
      // Find the corresponding peak value
      // For simplicity we apply drawdown relative to value at year start
      if (crisisEffect < 0) {
        // reduce growth or apply loss
        const loss = Math.abs(crisisEffect) * 0.35; // scaled to avoid compound distortion
        value = value * (1 - loss);
      } else {
        // normal growth year after recovery
        value = value * (1 + avgGrowth);
      }
    } else {
      value = value * (1 + avgGrowth);
    }

    points.push({ year: y, value: Math.round(value * 100) / 100 });
  }

  return points;
}

export const SOURCES = [
  {
    name: 'Dimson, Marsh & Staunton (DMS)',
    description: 'UBS Global Investment Returns Yearbook – historische Rekonstruktion des globalen Aktienmarkts seit 1900.',
  },
  {
    name: 'MSCI ACWI',
    description: 'MSCI All Country World Index – moderner marktkapitalisierungsorientierter Weltaktienindex seit 1987.',
  },
  {
    name: 'FTSE All-World',
    description: 'FTSE Global Equity Index Series – ergänzender moderner Weltaktienindex (optional).',
  },
];
