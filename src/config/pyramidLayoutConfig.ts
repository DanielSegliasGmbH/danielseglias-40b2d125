/**
 * Zentrale Layout-Konfiguration für die Pyramide
 * 
 * Hier können Spalten-Spans und Breakpoints angepasst werden.
 * Grid basiert auf 12 Spalten (Desktop), 8 Spalten (Tablet).
 */

export interface GridSpan {
  colStart: number;
  colEnd: number;
}

export interface LevelLayout {
  title: GridSpan;
  items: GridSpan[];
}

// Desktop: 12-Spalten Grid
export const desktopLayout: Record<string, LevelLayout> = {
  level_1: {
    title: { colStart: 5, colEnd: 9 },
    items: [
      { colStart: 5, colEnd: 9 }, // 1 Item, mittig (4 Spalten)
    ],
  },
  level_2: {
    title: { colStart: 3, colEnd: 11 },
    items: [
      { colStart: 3, colEnd: 6 },  // Item A (3 Spalten)
      { colStart: 7, colEnd: 10 }, // Item B (3 Spalten)
    ],
  },
  level_3: {
    title: { colStart: 2, colEnd: 12 },
    items: [
      { colStart: 2, colEnd: 5 },  // Item A
      { colStart: 5, colEnd: 9 },  // Item B
      { colStart: 9, colEnd: 12 }, // Item C
    ],
  },
  level_4: {
    title: { colStart: 1, colEnd: 13 },
    items: [
      { colStart: 1, colEnd: 4 },   // Item A
      { colStart: 4, colEnd: 7 },   // Item B
      { colStart: 7, colEnd: 10 },  // Item C
      { colStart: 10, colEnd: 13 }, // Item D
    ],
  },
};

// Tablet: 8-Spalten Grid (>= 768px und < 1024px)
export const tabletLayout: Record<string, LevelLayout> = {
  level_1: {
    title: { colStart: 3, colEnd: 7 },
    items: [
      { colStart: 3, colEnd: 7 }, // 1 Item, mittig
    ],
  },
  level_2: {
    title: { colStart: 2, colEnd: 8 },
    items: [
      { colStart: 2, colEnd: 5 },
      { colStart: 5, colEnd: 8 },
    ],
  },
  level_3: {
    title: { colStart: 1, colEnd: 9 },
    items: [
      { colStart: 1, colEnd: 3 },
      { colStart: 3, colEnd: 6 },
      { colStart: 6, colEnd: 9 },
    ],
  },
  level_4: {
    title: { colStart: 1, colEnd: 9 },
    items: [
      { colStart: 1, colEnd: 3 },
      { colStart: 3, colEnd: 5 },
      { colStart: 5, colEnd: 7 },
      { colStart: 7, colEnd: 9 },
    ],
  },
};

// Grid-Klassen für Tailwind
export const gridConfig = {
  desktop: {
    columns: 12,
    gap: 'gap-4 lg:gap-6',
    maxWidth: 'max-w-6xl',
  },
  tablet: {
    columns: 8,
  },
  mobile: {
    // Mobile: horizontales Scrollen pro Level
    scrollable: true,
  },
};
