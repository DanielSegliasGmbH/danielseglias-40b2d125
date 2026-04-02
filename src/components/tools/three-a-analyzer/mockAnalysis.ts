import { AnalysisData, EMPTY_ANALYSIS } from './types';

/**
 * Mock analysis data for MVP demonstration.
 * In a future version, this will be replaced by OpenAI-powered document extraction.
 */
export function generateMockAnalysis(): AnalysisData {
  return {
    ...EMPTY_ANALYSIS,
    provider: null,
    productName: null,
    productType: null,
    contributionAmount: null,
    contributionFrequency: null,
    contractStart: null,
    contractEnd: null,
    remainingYears: null,
    paidContributions: null,
    currentValue: null,
    guaranteedValue: null,
    funds: [],
    equityQuota: null,
    strategyClassification: null,
    costs: {
      acquisition: { label: 'Abschlusskosten', value: null, isVerified: false },
      ongoing: { label: 'Laufende Kosten', value: null, isVerified: false },
      management: { label: 'Verwaltungsgebühren', value: null, isVerified: false },
      fundFees: { label: 'Fondsgebühren / TER', value: null, isVerified: false },
      other: { label: 'Sonstige Kosten', value: null, isVerified: false },
    },
    flexibility: {
      contributionAdjustment: null,
      pause: null,
      cancellationDisadvantages: null,
    },
    issues: [
      {
        severity: 'info',
        title: 'Automatische Analyse ausstehend',
        description: 'Die Dokumentenanalyse wird in einer zukünftigen Version automatisiert. Aktuell werden die hochgeladenen Dokumente gespeichert und können für eine manuelle Prüfung verwendet werden.',
      },
    ],
    initialAssessment:
      'Deine Dokumente wurden erfolgreich hochgeladen und gespeichert. ' +
      'Die automatische Extraktion der Vertragsdaten wird in einer zukünftigen Version verfügbar sein. ' +
      'Du kannst bereits jetzt eine vertiefte Analyse anfragen – unsere Experten prüfen deine Unterlagen persönlich.',
  };
}

/**
 * Service interface for future AI-powered analysis.
 * This module is designed to be replaced with an actual implementation
 * that connects to OpenAI or another document analysis service.
 */
export interface AnalysisService {
  analyzeDocuments(analysisId: string): Promise<AnalysisData>;
}

/**
 * Mock implementation of the analysis service.
 */
export class MockAnalysisService implements AnalysisService {
  async analyzeDocuments(_analysisId: string): Promise<AnalysisData> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return generateMockAnalysis();
  }
}
