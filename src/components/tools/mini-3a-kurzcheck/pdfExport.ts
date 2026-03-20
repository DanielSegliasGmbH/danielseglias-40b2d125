import jsPDF from 'jspdf';
import { Mini3aInputs, Mini3aResult, CategoryLinks, CATEGORY_KEYS, CATEGORY_LABELS } from './types';

const OLIVE = [122, 122, 103] as const;
const DARK = [17, 24, 39] as const;
const MUTED = [107, 114, 128] as const;
const WHITE = [255, 255, 255] as const;
const BG = [250, 250, 250] as const;

function addHeader(doc: jsPDF, title: string, pageW: number) {
  doc.setFillColor(...BG);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Mini-3A-Kurzcheck', 15, 14);
  doc.text(title, pageW - 15, 14, { align: 'right' });
}

function addFooter(doc: jsPDF, page: number, total: number, pageW: number, pageH: number) {
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Seite ${page} von ${total}`, pageW / 2, pageH - 8, { align: 'center' });
  doc.text('Daniel Seglias GmbH – danielseglias.ch', pageW - 15, pageH - 8, { align: 'right' });
}

function ratingText(score: number) {
  if (score >= 70) return 'Gut';
  if (score >= 40) return 'Mittel';
  return 'Schwach';
}

export function generateOnePager(inputs: Mini3aInputs, result: Mini3aResult, links: CategoryLinks) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pw = 297, ph = 210;
  const totalPages = 4;

  // Page 1: Eingaben
  addHeader(doc, 'Eingaben', pw);
  let y = 32;
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text('Eingaben & Kundendaten', 15, y);
  y += 10;
  doc.setFontSize(10);
  const fields = [
    ['Kundenname', inputs.kundenname],
    ['Firma / Anbieter', inputs.firma],
    ['Produkt', inputs.produkt],
    ['Typ', inputs.typ === 'bank' ? `Bank (${inputs.bankArt === 'digital' ? 'Digital' : 'Hausbank'})` : 'Versicherung'],
    ['Alter', `${inputs.alter} Jahre`],
    ['Pensionsalter', `${inputs.pensionsalter}`],
    ['Monatl. Einzahlung', `CHF ${inputs.monatlicheEinzahlung.toLocaleString('de-CH')}`],
    ['Aktien investiert', inputs.inAktienInvestiert ? `Ja (${inputs.aktienquote}%)` : `Nein (tech. Zins: ${inputs.technischerZins}%)`],
    ['Verwaltungsgebühren', `${inputs.verwaltungsgebuehren}% p.a.`],
    ['Abschlusskosten', `CHF ${inputs.abschlusskosten.toLocaleString('de-CH')}`],
    ['Ausgabeaufschlag', `${inputs.ausgabeaufschlag}%`],
    ['Rücknahmekommission', `${inputs.ruecknahmekommission}%`],
    ['Transparenz-Aufwand', `${inputs.transparenzAufwand} / 10`],
  ];
  fields.forEach(([label, val]) => {
    doc.setTextColor(...MUTED);
    doc.text(label, 20, y);
    doc.setTextColor(...DARK);
    doc.text(String(val || '–'), 100, y);
    y += 7;
  });
  addFooter(doc, 1, totalPages, pw, ph);

  // Page 2: Auswertung
  doc.addPage();
  addHeader(doc, 'Auswertung', pw);
  y = 32;
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text('Auswertung', 15, y);
  y += 12;
  // KPIs
  doc.setFontSize(24);
  doc.setTextColor(...OLIVE);
  doc.text(`${result.gesamtscore} / 100`, 20, y);
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`${result.sterne.toFixed(1)} Sterne  |  ${result.jahreBisPension} Jahre bis Pension`, 80, y);
  doc.text(result.bewertungsText, 20, y + 8);
  y += 22;
  // Category scores
  doc.setFontSize(10);
  result.categories.forEach((cat) => {
    doc.setTextColor(...DARK);
    doc.text(cat.label, 20, y);
    doc.setTextColor(...MUTED);
    doc.text(`${cat.score} / 100 – ${ratingText(cat.score)}`, 120, y);
    y += 7;
  });
  addFooter(doc, 2, totalPages, pw, ph);

  // Page 3: Visualisierung (text-based since we can't embed canvas easily)
  doc.addPage();
  addHeader(doc, 'Visualisierung', pw);
  y = 32;
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text('Kosten-Übersicht', 15, y);
  y += 12;
  doc.setFontSize(10);
  const costItems = [
    ['Einzahlungen total', result.costBreakdown.einzahlungen],
    ['Abschlusskosten', result.costBreakdown.abschlusskosten],
    ['Laufende Kosten', result.costBreakdown.laufendeKosten],
    ['Ausgabeaufschlag', result.costBreakdown.ausgabeaufschlag],
    ['Rücknahmekommission', result.costBreakdown.ruecknahmekommission],
    ['Zinsen (erwartet)', result.costBreakdown.zinsen],
  ] as const;
  costItems.forEach(([label, val]) => {
    doc.setTextColor(...DARK);
    doc.text(label, 20, y);
    doc.setTextColor(...OLIVE);
    doc.text(`CHF ${val.toLocaleString('de-CH')}`, 120, y);
    y += 7;
  });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text('Empfehlung', 20, y);
  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const empLines = doc.splitTextToSize(result.empfehlung, pw - 40);
  doc.text(empLines, 20, y);
  addFooter(doc, 3, totalPages, pw, ph);

  // Page 4: Links
  doc.addPage();
  addHeader(doc, 'Links', pw);
  y = 32;
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text('Weiterführende Links', 15, y);
  y += 12;
  doc.setFontSize(10);
  CATEGORY_KEYS.forEach(key => {
    const catLinks = (links[key] || []).filter(l => l.url);
    if (!catLinks.length) return;
    doc.setTextColor(...DARK);
    doc.text(CATEGORY_LABELS[key], 20, y);
    y += 6;
    catLinks.forEach(l => {
      doc.setTextColor(...OLIVE);
      doc.text(`• ${l.titel || l.url}`, 25, y);
      doc.setTextColor(...MUTED);
      doc.text(l.url, 120, y);
      y += 5;
    });
    y += 3;
  });
  addFooter(doc, 4, totalPages, pw, ph);

  doc.save(`Mini-3A-Kurzcheck_${inputs.kundenname || 'Auswertung'}_OnePager.pdf`);
}

export function generateReport(inputs: Mini3aInputs, result: Mini3aResult, links: CategoryLinks) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pw = 297, ph = 210;
  const totalPages = 11;

  // Page 1: Titel
  addHeader(doc, 'Report', pw);
  let y = 50;
  doc.setFontSize(28);
  doc.setTextColor(...OLIVE);
  doc.text('Mini-3A-Kurzcheck', pw / 2, y, { align: 'center' });
  y += 14;
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text(`Report für ${inputs.kundenname || 'Kunde'}`, pw / 2, y, { align: 'center' });
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(`${inputs.firma || 'Anbieter'} – ${inputs.produkt || 'Produkt'}`, pw / 2, y, { align: 'center' });
  y += 20;
  doc.setFontSize(36);
  doc.setTextColor(...OLIVE);
  doc.text(`${result.gesamtscore} / 100`, pw / 2, y, { align: 'center' });
  y += 12;
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(result.bewertungsText, pw / 2, y, { align: 'center' });
  y += 16;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const empSplit = doc.splitTextToSize(result.empfehlung, 200);
  doc.text(empSplit, pw / 2, y, { align: 'center' });
  addFooter(doc, 1, totalPages, pw, ph);

  // Page 2: Überblick
  doc.addPage();
  addHeader(doc, 'Überblick', pw);
  y = 32;
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text('Überblick & Kontext', 15, y);
  y += 10;
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const ctx = [
    `Dieser Report basiert auf dem Mini-3A-Kurzcheck und gibt eine qualitative Einschätzung der bestehenden Säule-3a-Lösung.`,
    `Die Bewertung erfolgt in 5 Primärkategorien und 3 abgeleiteten Meta-Kategorien.`,
    `Der Gesamtscore von ${result.gesamtscore}/100 entspricht ${result.sterne.toFixed(1)} von 5 Sternen.`,
    `Laufzeit: ${result.jahreBisPension} Jahre bis Pension (Alter ${inputs.alter} → ${inputs.pensionsalter}).`,
    `Monatliche Einzahlung: CHF ${inputs.monatlicheEinzahlung.toLocaleString('de-CH')}.`,
    ``,
    `Hinweis: Alle Werte sind vereinfachte Schätzungen und dienen als Diskussionsgrundlage.`,
  ];
  ctx.forEach(line => {
    doc.text(line, 20, y);
    y += 6;
  });
  // Score summary
  y += 5;
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text('Bewertungsübersicht', 20, y);
  y += 8;
  doc.setFontSize(10);
  result.categories.forEach(cat => {
    doc.setTextColor(...DARK);
    doc.text(cat.label, 25, y);
    doc.setTextColor(...OLIVE);
    doc.text(`${cat.score}/100`, 140, y);
    doc.setTextColor(...MUTED);
    doc.text(ratingText(cat.score), 160, y);
    y += 6;
  });
  addFooter(doc, 2, totalPages, pw, ph);

  // Pages 3-10: Category details
  result.categories.forEach((cat, i) => {
    doc.addPage();
    addHeader(doc, cat.label, pw);
    y = 32;
    doc.setFontSize(18);
    doc.setTextColor(...DARK);
    doc.text(cat.label, 15, y);
    doc.setFontSize(12);
    doc.setTextColor(...OLIVE);
    doc.text(`${cat.score} / 100 – ${ratingText(cat.score)}`, pw - 15, y, { align: 'right' });
    y += 14;

    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text('Vorteile', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    cat.vorteile.forEach(v => {
      doc.text(`✓  ${v}`, 25, y);
      y += 6;
    });
    y += 5;

    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text('Nachteile & Risiken', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    cat.nachteile.forEach(n => {
      doc.text(`✗  ${n}`, 25, y);
      y += 6;
    });
    y += 5;

    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text('Fazit', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const fazitLines = doc.splitTextToSize(cat.fazit, pw - 50);
    doc.text(fazitLines, 25, y);
    y += fazitLines.length * 5 + 8;

    // Links for this category
    const catLinks = (links[CATEGORY_KEYS[i]] || []).filter(l => l.url);
    if (catLinks.length) {
      doc.setFontSize(11);
      doc.setTextColor(...DARK);
      doc.text('Links', 20, y);
      y += 6;
      doc.setFontSize(9);
      catLinks.forEach(l => {
        doc.setTextColor(...OLIVE);
        doc.text(`→ ${l.titel || l.url}: ${l.url}`, 25, y);
        y += 5;
      });
    }
    addFooter(doc, 3 + i, totalPages, pw, ph);
  });

  // Page 11: Nächste Schritte
  doc.addPage();
  addHeader(doc, 'Nächste Schritte', pw);
  y = 40;
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.text('Nächste Schritte', pw / 2, y, { align: 'center' });
  y += 14;
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  const steps = [
    '1. Ergebnisse im persönlichen Gespräch besprechen',
    '2. Schwachstellen identifizieren und priorisieren',
    '3. Konkrete Alternativen prüfen und vergleichen',
    '4. Entscheidung treffen und Umsetzung planen',
    '5. Laufende Begleitung und Optimierung sicherstellen',
  ];
  steps.forEach(s => {
    doc.text(s, pw / 2, y, { align: 'center' });
    y += 9;
  });
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(...OLIVE);
  doc.text('Daniel Seglias GmbH', pw / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('danielseglias.ch  |  info@danielseglias.ch', pw / 2, y, { align: 'center' });
  addFooter(doc, 11, totalPages, pw, ph);

  doc.save(`Mini-3A-Kurzcheck_${inputs.kundenname || 'Auswertung'}_Report.pdf`);
}
