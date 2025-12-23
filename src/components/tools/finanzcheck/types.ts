export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface UserData {
  age: number | null;
  income: number | null;
  expenses: number | null;
  thirdPillar: 'yes' | 'no' | 'unsure' | null;
  thirdPillarType: string | null;
  categoryInterest: Record<string, boolean | undefined>;
  answers: Record<string, string>;
}

export interface CategoryScore {
  categoryId: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface Recommendation {
  categoryId: string;
  categoryLabel: string;
  text: string;
  priority: 'high' | 'medium';
}

export interface FinanzcheckResult {
  overallScore: number;
  categoryScores: CategoryScore[];
  recommendations: Recommendation[];
}
