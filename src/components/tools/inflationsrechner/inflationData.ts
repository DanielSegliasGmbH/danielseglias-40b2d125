// Swiss CPI annual inflation rates (%) — Source: BFS Landesindex der Konsumentenpreise (LIK)
export const swissInflationRates: Record<number, number> = {
  1950: 0.9, 1951: 3.8, 1952: 0.2, 1953: -0.6, 1954: 0.9,
  1955: 0.3, 1956: 1.0, 1957: 2.2, 1958: 1.4, 1959: -0.2,
  1960: 1.5, 1961: 2.0, 1962: 4.4, 1963: 3.4, 1964: 3.1,
  1965: 3.6, 1966: 4.7, 1967: 3.9, 1968: 2.4, 1969: 2.5,
  1970: 3.6, 1971: 6.6, 1972: 6.7, 1973: 8.7, 1974: 9.8,
  1975: 6.7, 1976: 1.7, 1977: 1.3, 1978: 1.0, 1979: 3.6,
  1980: 4.0, 1981: 6.5, 1982: 5.7, 1983: 2.9, 1984: 2.9,
  1985: 3.4, 1986: 0.8, 1987: 1.4, 1988: 1.9, 1989: 3.2,
  1990: 5.4, 1991: 5.8, 1992: 4.0, 1993: 3.3, 1994: 0.9,
  1995: 1.8, 1996: 0.8, 1997: 0.5, 1998: 0.0, 1999: 0.8,
  2000: 1.6, 2001: 1.0, 2002: 0.6, 2003: 0.6, 2004: 0.8,
  2005: 1.2, 2006: 1.1, 2007: 0.7, 2008: 2.4, 2009: -0.5,
  2010: 0.7, 2011: 0.2, 2012: -0.7, 2013: -0.2, 2014: 0.0,
  2015: -1.1, 2016: -0.4, 2017: 0.5, 2018: 0.9, 2019: 0.4,
  2020: -0.7, 2021: 0.6, 2022: 2.8, 2023: 2.1, 2024: 1.1,
  2025: 0.8,
};

export const availableYears = Object.keys(swissInflationRates).map(Number).sort((a, b) => a - b);
export const minYear = availableYears[0];
export const maxYear = availableYears[availableYears.length - 1];

// Future projection: purchasing power after N years at given inflation rate
export function calcFutureProjection(amount: number, years: number, inflationRate: number) {
  const points: { year: number; value: number }[] = [];
  for (let i = 0; i <= years; i++) {
    const value = amount / Math.pow(1 + inflationRate / 100, i);
    points.push({ year: i, value: Math.round(value * 100) / 100 });
  }
  const endValue = points[points.length - 1].value;
  const loss = ((amount - endValue) / amount) * 100;
  return { points, endValue, lossPercent: Math.round(loss * 10) / 10 };
}

// Past projection using real Swiss CPI data
export function calcPastProjection(amount: number, startYear: number, endYear: number) {
  const from = Math.max(startYear, minYear);
  const to = Math.min(endYear, maxYear);
  const points: { year: number; value: number }[] = [{ year: from, value: amount }];
  let cumulative = 1;
  for (let y = from + 1; y <= to; y++) {
    const rate = swissInflationRates[y] ?? 0;
    cumulative *= 1 + rate / 100;
    points.push({ year: y, value: Math.round((amount / cumulative) * 100) / 100 });
  }
  const endValue = points[points.length - 1].value;
  const loss = ((amount - endValue) / amount) * 100;
  return { points, endValue, lossPercent: Math.round(loss * 10) / 10 };
}

// Inflate a price for life examples
export function inflatePrice(price: number, years: number, rate: number) {
  return Math.round(price * Math.pow(1 + rate / 100, years) * 100) / 100;
}

export interface LifeExample {
  key: string;
  icon: string; // lucide icon name
  label: string;
  priceToday: number;
  unit: string;
}

export const lifeExamples: LifeExample[] = [
  { key: 'beer', icon: 'Beer', label: 'Bier (5dl)', priceToday: 7, unit: 'CHF' },
  { key: 'rent', icon: 'Home', label: 'Miete (Monat)', priceToday: 1650, unit: 'CHF' },
  { key: 'car', icon: 'Car', label: 'Neuwagen', priceToday: 38000, unit: 'CHF' },
  { key: 'food', icon: 'UtensilsCrossed', label: 'Essen (Restaurant)', priceToday: 28, unit: 'CHF' },
  { key: 'flight', icon: 'Plane', label: 'Flug (ZRH–BCN)', priceToday: 180, unit: 'CHF' },
  { key: 'clothing', icon: 'Shirt', label: 'T-Shirt', priceToday: 45, unit: 'CHF' },
];

export function formatCHF(value: number): string {
  return value.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
