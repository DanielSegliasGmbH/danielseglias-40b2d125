/**
 * Tool clustering configuration.
 * Maps tool keys to logical clusters for visual grouping in the UI.
 * Sort order ranges: 100-199 Standort, 200-299 Kosten, 300-399 Risiko,
 * 400-499 Dringlichkeit, 500-599 Vertrauen, 600-699 Spezial, 900+ Geplant
 */

export type ToolClusterKey = 'standort' | 'kosten' | 'risiko' | 'dringlichkeit' | 'vertrauen' | 'spezial';

export interface ToolCluster {
  key: ToolClusterKey;
  i18nKey: string;
  sortRange: [number, number];
}

export const TOOL_CLUSTERS: ToolCluster[] = [
  { key: 'standort', i18nKey: 'toolClusters.standort', sortRange: [100, 199] },
  { key: 'kosten', i18nKey: 'toolClusters.kosten', sortRange: [200, 299] },
  { key: 'risiko', i18nKey: 'toolClusters.risiko', sortRange: [300, 399] },
  { key: 'dringlichkeit', i18nKey: 'toolClusters.dringlichkeit', sortRange: [400, 499] },
  { key: 'vertrauen', i18nKey: 'toolClusters.vertrauen', sortRange: [500, 599] },
  { key: 'spezial', i18nKey: 'toolClusters.spezial', sortRange: [600, 699] },
];

export function getClusterForTool(sortOrder: number): ToolCluster | null {
  return TOOL_CLUSTERS.find(c => sortOrder >= c.sortRange[0] && sortOrder <= c.sortRange[1]) ?? null;
}

export function groupToolsByCluster<T extends { sort_order: number }>(tools: T[]): { cluster: ToolCluster; tools: T[] }[] {
  const groups: { cluster: ToolCluster; tools: T[] }[] = [];

  for (const cluster of TOOL_CLUSTERS) {
    const clusterTools = tools.filter(t => t.sort_order >= cluster.sortRange[0] && t.sort_order <= cluster.sortRange[1]);
    if (clusterTools.length > 0) {
      groups.push({ cluster, tools: clusterTools });
    }
  }

  // Unclustered tools (planned etc.)
  const clustered = new Set(tools.filter(t => TOOL_CLUSTERS.some(c => t.sort_order >= c.sortRange[0] && t.sort_order <= c.sortRange[1])));
  const unclustered = tools.filter(t => !clustered.has(t));
  if (unclustered.length > 0) {
    groups.push({ cluster: { key: 'spezial' as ToolClusterKey, i18nKey: 'adminTools.planned', sortRange: [900, 999] }, tools: unclustered });
  }

  return groups;
}
