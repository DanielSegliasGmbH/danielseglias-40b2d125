import jsPDF from 'jspdf';
import { AnalysisData, AnalysisResult, CostPosition } from './types';

// ── Helpers ──

const MARGIN = 20;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const PRIMARY_COLOR: [number, number, number] = [34, 60, 80];
const ACCENT_GREEN: [number, number, number] = [16, 120, 70];
const MUTED_COLOR: [number, number, number] = [120, 120, 130];
const RED_COLOR: [number, number, number] = [180, 40, 40];
const TEXT_COLOR: [number, number, number] = [30, 30, 35];

function formatCHF(value: number | null): string {
  if (value === null || value === undefined) return '–';
  return `CHF ${Math.round(value).toLocaleString('de-CH')}`;
}

function safeNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/['']/g, '').replace(',', '.').replace(/[^\d.\-]/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? null : n;
  }
  return null;
}

function getFormattedDate(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

function getFileDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

class PdfBuilder {
  private doc: jsPDF;
  private y: number = MARGIN;
  private pageNum: number = 1;
  private totalPages: number = 0;

  constructor() {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  }

  private ensureSpace(needed: number) {
    if (this.y + needed > PAGE_H - MARGIN - 10) {
      this.newPage();
    }
  }

  private newPage() {
    this.doc.addPage();
    this.pageNum++;
    this.y = MARGIN;
  }

  private setFont(style: 'normal' | 'bold' | 'italic' = 'normal', size: number = 10) {
    this.doc.setFont('helvetica', style);
    this.doc.setFontSize(size);
  }

  private setColor(color: [number, number, number]) {
    this.doc.setTextColor(color[0], color[1], color[2]);
  }

  // Returns height used
  private writeText(text: string, x: number, maxWidth: number, options?: {
    fontSize?: number;
    color?: [number, number, number];
    bold?: boolean;
    italic?: boolean;
    lineHeight?: number;
    align?: 'left' | 'center' | 'right';
  }): number {
    const fontSize = options?.fontSize || 10;
    const color = options?.color || TEXT_COLOR;
    const style = options?.bold ? 'bold' : options?.italic ? 'italic' : 'normal';
    const lineHeight = options?.lineHeight || fontSize * 0.45;

    this.setFont(style, fontSize);
    this.setColor(color);

    const lines = this.doc.splitTextToSize(text, maxWidth);
    const totalHeight = lines.length * lineHeight;

    this.ensureSpace(totalHeight);

    if (options?.align === 'center') {
      lines.forEach((line: string, i: number) => {
        this.doc.text(line, PAGE_W / 2, this.y + i * lineHeight, { align: 'center' });
      });
    } else if (options?.align === 'right') {
      lines.forEach((line: string, i: number) => {
        this.doc.text(line, x + maxWidth, this.y + i * lineHeight, { align: 'right' });
      });
    } else {
      this.doc.text(lines, x, this.y);
    }

    this.y += totalHeight;
    return totalHeight;
  }

  private drawLine(x1: number, x2: number, color?: [number, number, number]) {
    this.doc.setDrawColor(...(color || MUTED_COLOR));
    this.doc.setLineWidth(0.3);
    this.doc.line(x1, this.y, x2, this.y);
    this.y += 3;
  }

  private drawSectionTitle(title: string) {
    this.ensureSpace(14);
    this.y += 4;
    this.setFont('bold', 13);
    this.setColor(PRIMARY_COLOR);
    this.doc.text(title, MARGIN, this.y);
    this.y += 3;
    this.drawLine(MARGIN, MARGIN + CONTENT_W, PRIMARY_COLOR);
    this.y += 2;
  }

  private drawBulletList(items: string[]) {
    items.forEach((item) => {
      this.ensureSpace(10);
      this.setFont('normal', 9);
      this.setColor(TEXT_COLOR);
      const lines = this.doc.splitTextToSize(item, CONTENT_W - 8);
      this.doc.text('•', MARGIN + 2, this.y);
      this.doc.text(lines, MARGIN + 8, this.y);
      this.y += lines.length * 4.2 + 1.5;
    });
  }

  private drawKeyValue(label: string, value: string, valueColor?: [number, number, number]) {
    this.ensureSpace(7);
    this.setFont('normal', 8);
    this.setColor(MUTED_COLOR);
    this.doc.text(label, MARGIN + 2, this.y);
    this.setFont('bold', 10);
    this.setColor(valueColor || TEXT_COLOR);
    this.doc.text(value, MARGIN + 75, this.y);
    this.y += 6;
  }

  private addFooters() {
    this.totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= this.totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7);
      this.doc.setTextColor(160, 160, 165);
      // Skip footer on page 1 (title page)
      if (i > 1) {
        this.doc.text(
          `Analyse deiner Säule 3a – Daniel Seglias GmbH | Seite ${i - 1} von ${this.totalPages - 1}`,
          PAGE_W / 2, PAGE_H - 8, { align: 'center' }
        );
      }
    }
  }

  // ══════════════════════════════
  // PAGE BUILDERS
  // ══════════════════════════════

  buildTitlePage() {
    // Centered title page with generous whitespace
    this.y = 100;
    this.writeText('Analyse deiner Säule 3a', MARGIN, CONTENT_W, {
      fontSize: 26, bold: true, color: PRIMARY_COLOR, align: 'center',
    });
    this.y += 6;
    this.writeText('Verständliche Einordnung deiner aktuellen Lösung\nund möglicher Unterschiede', MARGIN, CONTENT_W, {
      fontSize: 12, color: MUTED_COLOR, align: 'center', lineHeight: 5.5,
    });
    this.y += 16;
    this.writeText(getFormattedDate(), MARGIN, CONTENT_W, {
      fontSize: 9, color: MUTED_COLOR, align: 'center',
    });
    this.y += 30;
    this.writeText(
      'Diese Analyse basiert auf den zur Verfügung gestellten Unterlagen und dient der ersten Orientierung.',
      MARGIN + 20, CONTENT_W - 40, {
        fontSize: 8, color: MUTED_COLOR, align: 'center', italic: true,
      }
    );
  }

  buildSummaryPage(data: AnalysisData, ar: AnalysisResult | null) {
    this.newPage();
    this.drawSectionTitle('Zusammenfassung');

    if (ar?.zusammenfassung?.titel) {
      this.writeText(ar.zusammenfassung.titel, MARGIN, CONTENT_W, {
        fontSize: 14, bold: true, color: PRIMARY_COLOR,
      });
      this.y += 3;
    }
    if (ar?.zusammenfassung?.kurztext) {
      this.writeText(ar.zusammenfassung.kurztext, MARGIN, CONTENT_W, {
        fontSize: 10, color: TEXT_COLOR, lineHeight: 4.5,
      });
      this.y += 4;
    }

    // Einordnung
    if (ar?.einordnung) {
      this.y += 4;
      if (ar.einordnung.produkttyp) {
        this.drawKeyValue('Produkttyp', ar.einordnung.produkttyp);
      }
      if (ar.einordnung.struktur) {
        this.drawKeyValue('Struktur', ar.einordnung.struktur);
      }
      if (ar.einordnung.kurzbewertung) {
        this.y += 2;
        this.writeText(ar.einordnung.kurzbewertung, MARGIN, CONTENT_W, {
          fontSize: 9, color: TEXT_COLOR, lineHeight: 4.2,
        });
      }
      if (ar.einordnung.kritische_einordnung) {
        this.y += 3;
        this.writeText(ar.einordnung.kritische_einordnung, MARGIN, CONTENT_W, {
          fontSize: 9, color: TEXT_COLOR, lineHeight: 4.2,
        });
      }
    }

    // Scorecard summary
    if (ar?.scorecard) {
      this.y += 6;
      this.writeText('Bewertung auf einen Blick', MARGIN, CONTENT_W, {
        fontSize: 11, bold: true, color: PRIMARY_COLOR,
      });
      this.y += 3;
      const items = [
        { label: 'Transparenz', val: ar.scorecard.transparenz?.wert },
        { label: 'Flexibilität', val: ar.scorecard.flexibilitaet?.wert },
        { label: 'Kostenklarheit', val: ar.scorecard.kostenklarheit?.wert },
        { label: 'Anlageklarheit', val: ar.scorecard.anlageklarheit?.wert },
        { label: 'Gesamt', val: ar.scorecard.gesamt_einordnung?.wert },
      ];
      items.forEach((item) => {
        if (item.val) {
          this.drawKeyValue(item.label, item.val);
        }
      });
    }
  }

  buildZahlenPage(ar: AnalysisResult | null) {
    if (!ar?.zahlenuebersicht) return;
    const z = ar.zahlenuebersicht;
    const einzahlung = safeNum(z.gesamteinzahlung);
    const prognose = safeNum(z.vertrag_prognose);
    const optimiert = safeNum(z.optimiertes_szenario);
    const diffAbs = safeNum(z.differenz_absolut);
    const diffPct = safeNum(z.differenz_prozent);

    if (einzahlung === null && prognose === null && optimiert === null) return;

    this.newPage();
    this.drawSectionTitle('Zahlenübersicht');

    // Big numbers
    if (einzahlung !== null) {
      this.drawKeyValue('Gesamteinzahlung', formatCHF(einzahlung));
    }
    if (prognose !== null) {
      this.drawKeyValue('Vertragsprognose', formatCHF(prognose));
    }
    if (optimiert !== null) {
      this.drawKeyValue('Optimiertes Szenario (8.5% p.a.)', formatCHF(optimiert), ACCENT_GREEN);
    }

    this.y += 4;

    // Differenz highlight box
    if (diffAbs !== null) {
      this.ensureSpace(30);
      // Draw a subtle box
      this.doc.setFillColor(240, 250, 245);
      this.doc.setDrawColor(180, 220, 200);
      this.doc.roundedRect(MARGIN, this.y, CONTENT_W, 24, 3, 3, 'FD');
      this.y += 8;
      this.writeText('Mögliche Differenz', MARGIN, CONTENT_W, {
        fontSize: 8, color: MUTED_COLOR, align: 'center',
      });
      this.y += 2;
      const diffText = `+${formatCHF(diffAbs)}${diffPct !== null ? `  (+${diffPct.toFixed(1)}%)` : ''}`;
      this.writeText(diffText, MARGIN, CONTENT_W, {
        fontSize: 18, bold: true, color: ACCENT_GREEN, align: 'center',
      });
      this.y += 8;
    }

    this.y += 4;
    this.writeText(
      'Dies ist die berechnete Differenz zwischen der aktuellen Vertragsprognose und einem optimierten Szenario mit 8.5% Nettorendite pro Jahr.',
      MARGIN, CONTENT_W, { fontSize: 8, color: MUTED_COLOR, lineHeight: 3.8 }
    );

    // Bar chart approximation using rectangles
    this.y += 8;
    this.drawBarChart(einzahlung, prognose, optimiert);

    // Inflation section
    if (ar.inflationssicht) {
      const realVertrag = safeNum(ar.inflationssicht.realwert_vertrag);
      const realOpt = safeNum(ar.inflationssicht.realwert_optimiert);
      if (realVertrag !== null || realOpt !== null) {
        this.y += 8;
        this.writeText('Kaufkraft nach Inflation (2.4% p.a.)', MARGIN, CONTENT_W, {
          fontSize: 11, bold: true, color: PRIMARY_COLOR,
        });
        this.y += 4;
        if (realVertrag !== null) {
          this.drawKeyValue('Realer Vertragswert', formatCHF(realVertrag));
        }
        if (realOpt !== null) {
          this.drawKeyValue('Realer optimierter Wert', formatCHF(realOpt), ACCENT_GREEN);
        }
        this.y += 2;
        const comment = ar.inflationssicht.kommentar ||
          'Diese Werte zeigen die heutige Kaufkraft unter Berücksichtigung einer Inflation von 2.4% pro Jahr.';
        this.writeText(comment, MARGIN, CONTENT_W, {
          fontSize: 8, color: MUTED_COLOR, italic: true, lineHeight: 3.8,
        });
      }
    }
  }

  private drawBarChart(einzahlung: number | null, prognose: number | null, optimiert: number | null) {
    const values = [
      { label: 'Einzahlung', val: einzahlung, color: [160, 170, 180] as [number, number, number] },
      { label: 'Vertragsprognose', val: prognose, color: PRIMARY_COLOR },
      { label: 'Optimiert (8.5%)', val: optimiert, color: [74, 222, 128] as [number, number, number] },
    ].filter(v => v.val !== null) as Array<{ label: string; val: number; color: [number, number, number] }>;

    if (values.length < 2) return;

    this.ensureSpace(60);

    const maxVal = Math.max(...values.map(v => v.val));
    const chartHeight = 45;
    const barWidth = Math.min(35, (CONTENT_W - 10) / values.length - 5);
    const chartX = MARGIN + (CONTENT_W - (values.length * (barWidth + 8))) / 2;

    values.forEach((v, i) => {
      const x = chartX + i * (barWidth + 8);
      const barH = (v.val / maxVal) * chartHeight;
      const barY = this.y + chartHeight - barH;

      this.doc.setFillColor(v.color[0], v.color[1], v.color[2]);
      this.doc.roundedRect(x, barY, barWidth, barH, 2, 2, 'F');

      // Value label above bar
      this.setFont('bold', 7);
      this.setColor(v.color);
      this.doc.text(formatCHF(v.val), x + barWidth / 2, barY - 2, { align: 'center' });

      // Label below bar
      this.setFont('normal', 7);
      this.setColor(MUTED_COLOR);
      const labelLines = this.doc.splitTextToSize(v.label, barWidth + 4);
      labelLines.forEach((line: string, li: number) => {
        this.doc.text(line, x + barWidth / 2, this.y + chartHeight + 4 + li * 3.5, { align: 'center' });
      });
    });

    this.y += chartHeight + 14;
  }

  buildAnalysisSection(ar: AnalysisResult | null, data: AnalysisData) {
    if (!ar) return;

    this.newPage();
    this.drawSectionTitle('Detailanalyse');

    // Struktur
    this.renderSection('Struktur der Lösung', ar.struktur_analyse?.inhalt);
    this.renderSection('Beiträge und Laufzeit', ar.beitrags_und_laufzeit_analyse?.inhalt);
    this.renderSection('Anlagestrategie', ar.anlage_analyse?.inhalt);

    // Costs
    this.renderCosts(data, ar);

    this.renderSection('Auffälligkeiten', ar.auffaelligkeiten?.inhalt);
    this.renderSection('Fehlende Informationen', ar.fehlende_daten_hinweise?.inhalt);
  }

  private renderSection(title: string, items?: string[] | null) {
    if (!items?.length) return;
    this.ensureSpace(14);
    this.y += 4;
    this.writeText(title, MARGIN, CONTENT_W, {
      fontSize: 11, bold: true, color: PRIMARY_COLOR,
    });
    this.y += 3;
    this.drawBulletList(items);
    this.y += 2;
  }

  private renderCosts(data: AnalysisData, ar: AnalysisResult) {
    const costs: CostPosition[] = [
      data.costs.acquisition,
      data.costs.ongoing,
      data.costs.management,
      data.costs.fundFees,
      data.costs.other,
    ];

    const hasCosts = costs.some(c => c.value !== null);
    if (!hasCosts && !ar.kosten_analyse?.inhalt?.length) return;

    this.ensureSpace(14);
    this.y += 4;
    this.writeText('Kosten und Gebühren', MARGIN, CONTENT_W, {
      fontSize: 11, bold: true, color: PRIMARY_COLOR,
    });
    this.y += 3;

    if (hasCosts) {
      costs.forEach((c) => {
        if (c.value !== null) {
          const suffix = c.isVerified ? '' : ' (unsicher)';
          this.drawKeyValue(c.label, `CHF ${c.value.toLocaleString('de-CH')}${suffix}`);
        }
      });
      this.y += 2;
    }

    if (ar.kosten_analyse?.inhalt?.length) {
      this.drawBulletList(ar.kosten_analyse.inhalt);
    }

    if (ar.kostenlogik_hinweise?.length) {
      this.y += 2;
      this.drawBulletList(ar.kostenlogik_hinweise);
    }
  }

  buildCriticalSection(ar: AnalysisResult | null) {
    if (!ar) return;

    const hasContent = ar.hauptprobleme?.length || ar.kritische_fragen?.length || ar.ersteinschaetzung?.inhalt?.length;
    if (!hasContent) return;

    this.newPage();
    this.drawSectionTitle('Kritische Einordnung');

    if (ar.hauptprobleme?.length) {
      this.writeText('Hauptprobleme', MARGIN, CONTENT_W, {
        fontSize: 11, bold: true, color: RED_COLOR,
      });
      this.y += 3;
      this.drawBulletList(ar.hauptprobleme);
      this.y += 3;
    }

    if (ar.kritische_fragen?.length) {
      this.writeText('Kritische Fragen', MARGIN, CONTENT_W, {
        fontSize: 11, bold: true, color: PRIMARY_COLOR,
      });
      this.y += 3;
      ar.kritische_fragen.forEach((frage) => {
        this.ensureSpace(10);
        this.setFont('normal', 9);
        this.setColor(TEXT_COLOR);
        const lines = this.doc.splitTextToSize(frage, CONTENT_W - 8);
        this.doc.text('?', MARGIN + 2, this.y);
        this.doc.text(lines, MARGIN + 8, this.y);
        this.y += lines.length * 4.2 + 1.5;
      });
      this.y += 3;
    }

    if (ar.ersteinschaetzung?.inhalt?.length) {
      this.writeText(ar.ersteinschaetzung.titel || 'Ersteinschätzung', MARGIN, CONTENT_W, {
        fontSize: 11, bold: true, color: PRIMARY_COLOR,
      });
      this.y += 3;
      this.drawBulletList(ar.ersteinschaetzung.inhalt);
    }
  }

  buildNextStepsPage(ar: AnalysisResult | null) {
    if (!ar?.naechste_schritte?.inhalt?.length) return;

    this.ensureSpace(30);
    this.y += 6;
    this.drawSectionTitle('Nächste Schritte');
    this.drawBulletList(ar.naechste_schritte.inhalt);
  }

  buildAboutPage() {
    this.newPage();
    this.y = 60;

    this.writeText('Über mich', MARGIN, CONTENT_W, {
      fontSize: 20, bold: true, color: PRIMARY_COLOR, align: 'center',
    });

    this.y += 10;

    const aboutTexts = [
      'Ich sehe mich nicht als klassischer Berater oder Vermittler.',
      'Mein Fokus liegt darauf, finanzielle Zusammenhänge verständlich zu machen und Menschen dabei zu helfen, Fehlentscheidungen zu vermeiden.',
      'Ich analysiere bestehende Lösungen, hinterfrage Strukturen und zeige auf, wo Unterschiede entstehen können – transparent, nachvollziehbar und ohne Verkaufsdruck.',
      'Ziel ist nicht, etwas zu verkaufen.\nZiel ist, dass du verstehst, was du tust.',
    ];

    aboutTexts.forEach((text) => {
      this.writeText(text, MARGIN + 15, CONTENT_W - 30, {
        fontSize: 10, color: TEXT_COLOR, lineHeight: 4.5, align: 'center',
      });
      this.y += 5;
    });

    this.y += 12;
    this.drawLine(MARGIN + 50, MARGIN + CONTENT_W - 50, MUTED_COLOR);
    this.y += 6;

    this.writeText('Interesse an einer vertieften Analyse?', MARGIN, CONTENT_W, {
      fontSize: 11, bold: true, color: PRIMARY_COLOR, align: 'center',
    });
    this.y += 4;
    this.writeText(
      'Kontaktiere mich direkt für eine persönliche Besprechung deiner Situation.',
      MARGIN + 20, CONTENT_W - 40, {
        fontSize: 9, color: MUTED_COLOR, align: 'center',
      }
    );
  }

  // ══════════════════════════════
  // MAIN EXPORT
  // ══════════════════════════════

  generate(data: AnalysisData): jsPDF {
    const ar = data.analysisResult;

    this.buildTitlePage();
    this.buildSummaryPage(data, ar);
    this.buildZahlenPage(ar);
    this.buildAnalysisSection(ar, data);
    this.buildCriticalSection(ar);
    this.buildNextStepsPage(ar);
    this.buildAboutPage();
    this.addFooters();

    return this.doc;
  }
}

export function exportAnalysisPdf(data: AnalysisData) {
  const builder = new PdfBuilder();
  const doc = builder.generate(data);
  doc.save(`3a-Analyse_${getFileDate()}.pdf`);
}
