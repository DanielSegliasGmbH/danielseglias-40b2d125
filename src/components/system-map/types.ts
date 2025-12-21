export const NODE_CATEGORIES = ['core', 'module', 'ui', 'security', 'automation', 'integration'] as const;
export type NodeCategory = typeof NODE_CATEGORIES[number];

export const NODE_IMPORTANCE = ['core', 'supporting', 'optional'] as const;
export type NodeImportance = typeof NODE_IMPORTANCE[number];

export const NODE_PHASES = [0, 1, 2, 3, 4] as const;
export type NodePhase = typeof NODE_PHASES[number];

export const EDGE_RELATIONS = ['owns', 'depends_on', 'uses', 'contains', 'manages', 'creates'] as const;
export type EdgeRelation = typeof EDGE_RELATIONS[number];

export interface SystemMapNode {
  id: string;
  key: string;
  label: string;
  category: NodeCategory;
  description: string | null;
  is_active: boolean;
  importance: NodeImportance;
  phase: NodePhase;
  position_x: number | null;
  position_y: number | null;
  created_at: string;
  updated_at: string;
}

export interface SystemMapEdge {
  id: string;
  source_key: string;
  target_key: string;
  relation: EdgeRelation;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NodeFormData {
  key: string;
  label: string;
  category: NodeCategory;
  description: string;
  is_active: boolean;
  importance: NodeImportance;
  phase: NodePhase;
}

export const categoryLabels: Record<NodeCategory, string> = {
  core: 'Core',
  module: 'Module',
  ui: 'UI',
  security: 'Security',
  automation: 'Automation',
  integration: 'Integration',
};

export const importanceLabels: Record<NodeImportance, string> = {
  core: 'Core',
  supporting: 'Supporting',
  optional: 'Optional',
};

export const categoryColors: Record<NodeCategory, string> = {
  core: 'hsl(var(--primary))',
  module: 'hsl(var(--chart-2))',
  ui: 'hsl(var(--chart-3))',
  security: 'hsl(var(--destructive))',
  automation: 'hsl(var(--chart-4))',
  integration: 'hsl(var(--chart-5))',
};
