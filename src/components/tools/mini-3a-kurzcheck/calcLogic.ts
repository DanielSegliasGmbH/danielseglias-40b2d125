import { Mini3aInputs, Mini3aResult, CategoryScore } from './types';

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function getRating(score: number): 'gut' | 'mittel' | 'schwach' {
  if (score >= 70) return 'gut';
  if (score >= 40) return 'mittel';
  return 'schwach';
}

function estimateRendite(inputs: Mini3aInputs): number {
  if (inputs.renditeAnnahme > 0) return inputs.renditeAnnahme;
  if (inputs.inAktienInvestiert) {
    return 1.5 + (inputs.aktienquote / 100) * 5.5; // 1.5% base + up to 5.5% for 100% equity
  }
  if (inputs.technischerZins > 0) return inputs.technischerZins;
  return 1.0;
}

function calcStruktur(inputs: Mini3aInputs): number {
  let score = 50;
  if (inputs.typ === 'bank') {
    score += 20;
    if (inputs.bankArt === 'digital') score += 15;
  } else {
    score -= 10; // Versicherung = komplexere Struktur
  }
  if (inputs.inAktienInvestiert && inputs.aktienquote >= 40) score += 10;
  if (inputs.verwaltungsgebuehren < 0.8) score += 10;
  if (inputs.abschlusskosten > 0) score -= 15;
  return clamp(score);
}

function calcKosten(inputs: Mini3aInputs): number {
  let score = 80;
  // Verwaltungsgebühren
  if (inputs.verwaltungsgebuehren > 1.5) score -= 30;
  else if (inputs.verwaltungsgebuehren > 1.0) score -= 15;
  else if (inputs.verwaltungsgebuehren > 0.5) score -= 5;
  // Abschlusskosten
  const laufzeit = inputs.pensionsalter - inputs.alter;
  const totalBeitraege = inputs.monatlicheEinzahlung * 12 * laufzeit;
  if (totalBeitraege > 0) {
    const abschlussRatio = inputs.abschlusskosten / totalBeitraege;
    if (abschlussRatio > 0.05) score -= 25;
    else if (abschlussRatio > 0.02) score -= 15;
    else if (abschlussRatio > 0) score -= 5;
  }
  // Ausgabeaufschlag
  if (inputs.ausgabeaufschlag > 3) score -= 15;
  else if (inputs.ausgabeaufschlag > 1) score -= 8;
  // Rücknahmekommission
  if (inputs.ruecknahmekommission > 1) score -= 10;
  else if (inputs.ruecknahmekommission > 0) score -= 5;
  return clamp(score);
}

function calcRenditechancen(inputs: Mini3aInputs): number {
  const rendite = estimateRendite(inputs);
  let score = 30;
  if (rendite >= 5) score = 90;
  else if (rendite >= 4) score = 75;
  else if (rendite >= 3) score = 60;
  else if (rendite >= 2) score = 45;
  else score = 25;
  // Netto nach Kosten
  const nettoRendite = rendite - inputs.verwaltungsgebuehren;
  if (nettoRendite < 1) score -= 15;
  if (inputs.inAktienInvestiert && inputs.aktienquote >= 60) score += 5;
  return clamp(score);
}

function calcFlexibilitaet(inputs: Mini3aInputs): number {
  let score = 60;
  if (inputs.typ === 'bank') {
    score += 25; // Banklösungen sind flexibler
    if (inputs.bankArt === 'digital') score += 10;
  } else {
    score -= 15; // Versicherung = weniger flexibel
    if (inputs.abschlusskosten > 0) score -= 10; // Lock-in
  }
  if (inputs.ruecknahmekommission > 0) score -= 10;
  return clamp(score);
}

function calcTransparenz(inputs: Mini3aInputs): number {
  // transparenzAufwand: 1 = sehr transparent, 10 = sehr intransparent
  const base = 100 - (inputs.transparenzAufwand - 1) * 10;
  let score = base;
  if (inputs.typ === 'versicherung') score -= 10;
  if (inputs.abschlusskosten > 0 && inputs.typ === 'versicherung') score -= 5;
  return clamp(score);
}

function calcVorsorgeluecke(primaries: number[]): number {
  const avg = primaries.reduce((a, b) => a + b, 0) / primaries.length;
  // Higher primary scores = higher chance of closing gap
  return clamp(avg * 0.9 + 5);
}

function calcZufriedenheit(primaries: number[]): number {
  const avg = primaries.reduce((a, b) => a + b, 0) / primaries.length;
  const min = Math.min(...primaries);
  // Satisfaction dragged down by weakest area
  return clamp(avg * 0.6 + min * 0.4);
}

function calcOptimierungspotenzial(primaries: number[]): number {
  const avg = primaries.reduce((a, b) => a + b, 0) / primaries.length;
  // Low scores = HIGH optimization potential (inverted)
  return clamp(100 - avg * 0.85);
}

function getVorteile(key: string, inputs: Mini3aInputs, score: number): string[] {
  const vorteile: string[] = [];
  switch (key) {
    case 'struktur':
      if (inputs.typ === 'bank') vorteile.push('Banklösung bietet einfache, transparente Struktur');
      if (inputs.bankArt === 'digital') vorteile.push('Digitale Plattform: moderne Verwaltung, oft günstiger');
      if (inputs.inAktienInvestiert) vorteile.push('Aktienbasierte Anlage ermöglicht langfristiges Wachstum');
      break;
    case 'kosten':
      if (inputs.verwaltungsgebuehren < 0.8) vorteile.push('Verwaltungsgebühren im günstigen Bereich');
      if (inputs.abschlusskosten === 0) vorteile.push('Keine Abschlusskosten – voller Beitrag fliesst in Vorsorge');
      if (inputs.ausgabeaufschlag === 0) vorteile.push('Kein Ausgabeaufschlag');
      break;
    case 'renditechancen':
      if (estimateRendite(inputs) >= 4) vorteile.push('Gute Renditeerwartung für langfristigen Vermögensaufbau');
      if (inputs.inAktienInvestiert && inputs.aktienquote >= 50) vorteile.push('Aktienquote ermöglicht Teilhabe an Marktentwicklung');
      break;
    case 'flexibilitaet':
      if (inputs.typ === 'bank') vorteile.push('Banklösung ermöglicht einfachen Anbieterwechsel');
      if (inputs.ruecknahmekommission === 0) vorteile.push('Keine Rücknahmekommission bei Auszahlung');
      break;
    case 'transparenz':
      if (inputs.transparenzAufwand <= 3) vorteile.push('Hohe Transparenz – Kosten und Struktur gut nachvollziehbar');
      break;
    default:
      if (score >= 70) vorteile.push('Insgesamt positiv eingeschätzt');
      break;
  }
  if (vorteile.length === 0) vorteile.push('Basisanforderungen erfüllt');
  return vorteile;
}

function getNachteile(key: string, inputs: Mini3aInputs, score: number): string[] {
  const nachteile: string[] = [];
  switch (key) {
    case 'struktur':
      if (inputs.typ === 'versicherung') nachteile.push('Versicherungsstruktur kann komplex und weniger effizient sein');
      if (!inputs.inAktienInvestiert) nachteile.push('Ohne Aktienanteil begrenzte Wachstumschancen');
      break;
    case 'kosten':
      if (inputs.verwaltungsgebuehren > 1.0) nachteile.push(`Verwaltungsgebühren von ${inputs.verwaltungsgebuehren}% p.a. können den Ertrag langfristig erheblich schmälern`);
      if (inputs.abschlusskosten > 0) nachteile.push(`Abschlusskosten von CHF ${inputs.abschlusskosten.toLocaleString('de-CH')} belasten die Vorsorge von Anfang an`);
      if (inputs.ausgabeaufschlag > 0) nachteile.push(`Ausgabeaufschlag von ${inputs.ausgabeaufschlag}% reduziert jeden Beitrag`);
      break;
    case 'renditechancen':
      if (estimateRendite(inputs) < 3) nachteile.push('Renditeerwartung eher tief – Inflationsschutz fragwürdig');
      if (inputs.verwaltungsgebuehren > 1.2) nachteile.push('Hohe Kosten fressen Rendite auf');
      break;
    case 'flexibilitaet':
      if (inputs.typ === 'versicherung') nachteile.push('Vertragliche Bindung schränkt Flexibilität ein');
      if (inputs.abschlusskosten > 0) nachteile.push('Abschlusskosten erzeugen wirtschaftlichen Lock-in');
      if (inputs.ruecknahmekommission > 0) nachteile.push('Rücknahmekommission erschwert Ausstieg');
      break;
    case 'transparenz':
      if (inputs.transparenzAufwand >= 7) nachteile.push('Geringe Transparenz – Kosten und Bedingungen schwer nachvollziehbar');
      if (inputs.typ === 'versicherung' && inputs.transparenzAufwand >= 5) nachteile.push('Versicherungsprodukte oft weniger transparent als Bankprodukte');
      break;
    default:
      if (score < 50) nachteile.push('In diesem Bereich besteht Verbesserungspotenzial');
      break;
  }
  if (nachteile.length === 0) nachteile.push('Keine wesentlichen Schwächen identifiziert');
  return nachteile;
}

function getFazit(key: string, score: number): string {
  const rating = getRating(score);
  const fazitMap: Record<string, Record<string, string>> = {
    struktur: {
      gut: 'Die Produktstruktur ist solide und zeitgemäss aufgestellt.',
      mittel: 'Die Struktur bietet Basis, aber es gibt modernere Alternativen.',
      schwach: 'Die Produktstruktur wirkt veraltet und könnte den Vermögensaufbau bremsen.',
    },
    kosten: {
      gut: 'Die Kostenstruktur ist wettbewerbsfähig und belastet die Vorsorge kaum.',
      mittel: 'Die Kosten sind akzeptabel, aber ein Vergleich mit günstigeren Alternativen lohnt sich.',
      schwach: 'Die Kostenbelastung ist hoch und kann über die Laufzeit einen signifikanten Renditenachteil verursachen.',
    },
    renditechancen: {
      gut: 'Gute Renditechancen für langfristigen Vermögensaufbau.',
      mittel: 'Renditeerwartung moderat – Optimierung könnte sinnvoll sein.',
      schwach: 'Renditechancen begrenzt – langfristig könnte erhebliches Potenzial verloren gehen.',
    },
    flexibilitaet: {
      gut: 'Hohe Flexibilität – Sie behalten die volle Kontrolle.',
      mittel: 'Mittlere Flexibilität – einzelne Einschränkungen könnten bei Veränderungen relevant werden.',
      schwach: 'Geringe Flexibilität – vertragliche Bindung und Kosten erschweren Anpassungen.',
    },
    transparenz: {
      gut: 'Hohe Transparenz – Kosten und Bedingungen sind klar nachvollziehbar.',
      mittel: 'Transparenz könnte besser sein – wichtige Details sind nicht auf Anhieb ersichtlich.',
      schwach: 'Mangelnde Transparenz – es besteht Risiko für versteckte Kosten oder Überraschungen.',
    },
    vorsorgeluecke: {
      gut: 'Bei dieser Konfiguration stehen die Chancen gut, die Vorsorgelücke effektiv zu schliessen.',
      mittel: 'Die Zielerreichung ist möglich, aber nicht sicher – eine Prüfung lohnt sich.',
      schwach: 'Das Risiko einer relevanten Vorsorgelücke ist erhöht – Handlungsbedarf wahrscheinlich.',
    },
    zufriedenheit: {
      gut: 'Die Lösung dürfte langfristig zufriedenstellend funktionieren.',
      mittel: 'Einzelne Aspekte könnten langfristig zu Unzufriedenheit führen.',
      schwach: 'Die Wahrscheinlichkeit späterer Unzufriedenheit ist erhöht.',
    },
    optimierungspotenzial: {
      gut: 'Es besteht ein deutliches Optimierungspotenzial – ein Vergleich lohnt sich sehr wahrscheinlich.',
      mittel: 'Moderates Potenzial – eine Zweitmeinung kann sinnvoll sein.',
      schwach: 'Wenig Optimierungspotenzial – die Lösung wirkt insgesamt gut aufgestellt.',
    },
  };
  return fazitMap[key]?.[rating] || 'Bewertung liegt vor.';
}

function getEmpfehlung(gesamtscore: number, categories: CategoryScore[]): string {
  const optScore = categories.find(c => c.key === 'optimierungspotenzial')?.score || 50;
  const kostenScore = categories.find(c => c.key === 'kosten')?.score || 50;

  if (gesamtscore >= 75 && optScore < 40) {
    return 'Ihre aktuelle 3a-Lösung ist insgesamt gut aufgestellt. Dennoch kann es sich lohnen, in einem kurzen Gespräch zu prüfen, ob einzelne Stellschrauben noch besser justiert werden können.';
  }
  if (gesamtscore >= 50) {
    let text = 'Es gibt Bereiche mit Optimierungspotenzial. ';
    if (kostenScore < 50) text += 'Insbesondere die Kostenstruktur verdient Aufmerksamkeit – über lange Laufzeiten können selbst kleine Kostenunterschiede einen grossen Effekt haben. ';
    text += 'Ein Beratungstermin kann Klarheit schaffen und konkrete Alternativen aufzeigen.';
    return text;
  }
  return 'Es bestehen mehrere Optimierungshebel, die in Summe einen erheblichen Unterschied machen können. Kosten, Struktur und Renditechancen sollten dringend im Detail geprüft werden. Ein persönliches Gespräch lohnt sich mit hoher Wahrscheinlichkeit.';
}

function getBewertungsText(score: number): string {
  if (score >= 75) return 'Sehr stark – kaum Handlungsbedarf';
  if (score >= 60) return 'Gut – ein paar Hebel vorhanden';
  if (score >= 40) return 'Mittel – Optimierung lohnt sich oft';
  return 'Schwach – hier liegt meist viel Potenzial';
}

export function calculateMini3a(inputs: Mini3aInputs): Mini3aResult {
  const laufzeit = Math.max(1, inputs.pensionsalter - inputs.alter);
  const rendite = estimateRendite(inputs);

  // Primary scores
  const strukturScore = calcStruktur(inputs);
  const kostenScore = calcKosten(inputs);
  const renditeScore = calcRenditechancen(inputs);
  const flexScore = calcFlexibilitaet(inputs);
  const transparenzScore = calcTransparenz(inputs);

  const primaries = [strukturScore, kostenScore, renditeScore, flexScore, transparenzScore];

  // Meta scores
  const vorsorgeScore = calcVorsorgeluecke(primaries);
  const zufriedenheitScore = calcZufriedenheit(primaries);
  const optimierungScore = calcOptimierungspotenzial(primaries);

  const allScores = [
    { key: 'struktur', score: strukturScore },
    { key: 'kosten', score: kostenScore },
    { key: 'renditechancen', score: renditeScore },
    { key: 'flexibilitaet', score: flexScore },
    { key: 'transparenz', score: transparenzScore },
    { key: 'vorsorgeluecke', score: vorsorgeScore },
    { key: 'zufriedenheit', score: zufriedenheitScore },
    { key: 'optimierungspotenzial', score: optimierungScore },
  ];

  const categories: CategoryScore[] = allScores.map(({ key, score }) => ({
    key,
    label: {
      struktur: 'Struktur',
      kosten: 'Kosten',
      renditechancen: 'Renditechancen',
      flexibilitaet: 'Flexibilität',
      transparenz: 'Transparenz',
      vorsorgeluecke: 'Vorsorgelücke schliessen',
      zufriedenheit: 'Erwartete Zufriedenheit',
      optimierungspotenzial: 'Optimierungspotenzial',
    }[key] || key,
    score,
    rating: getRating(key === 'optimierungspotenzial' ? 100 - score : score),
    vorteile: getVorteile(key, inputs, score),
    nachteile: getNachteile(key, inputs, score),
    fazit: getFazit(key, score),
  }));

  const gesamtscore = clamp(Math.round(primaries.reduce((a, b) => a + b, 0) / primaries.length));
  const sterne = Math.round((gesamtscore / 20) * 10) / 10;

  // Cost breakdown
  const totalBeitraege = inputs.monatlicheEinzahlung * 12 * laufzeit;
  const laufendeKostenTotal = totalBeitraege * (inputs.verwaltungsgebuehren / 100) * laufzeit * 0.5;
  const ausgabeaufschlagTotal = totalBeitraege * (inputs.ausgabeaufschlag / 100);
  const ruecknahmeTotal = totalBeitraege * (inputs.ruecknahmekommission / 100);
  const nettoRate = rendite - inputs.verwaltungsgebuehren;
  const zinsFaktor = nettoRate > 0
    ? ((Math.pow(1 + nettoRate / 100, laufzeit) - 1) / (nettoRate / 100)) * (inputs.monatlicheEinzahlung * 12)
    : totalBeitraege;
  const zinsen = Math.max(0, zinsFaktor - totalBeitraege);

  return {
    gesamtscore,
    sterne,
    jahreBisPension: laufzeit,
    categories,
    empfehlung: getEmpfehlung(gesamtscore, categories),
    costBreakdown: {
      einzahlungen: totalBeitraege,
      abschlusskosten: inputs.abschlusskosten,
      laufendeKosten: Math.round(laufendeKostenTotal),
      ausgabeaufschlag: Math.round(ausgabeaufschlagTotal),
      ruecknahmekommission: Math.round(ruecknahmeTotal),
      zinsen: Math.round(zinsen),
    },
    bewertungsText: getBewertungsText(gesamtscore),
  };
}
