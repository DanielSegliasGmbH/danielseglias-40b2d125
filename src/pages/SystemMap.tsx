import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { SystemMapGraph } from '@/components/system-map/SystemMapGraph';
import { SystemMapDetailPanel } from '@/components/system-map/SystemMapDetailPanel';
import { SystemMapFilters } from '@/components/system-map/SystemMapFilters';
import { useSystemMapNodes, useSystemMapEdges, SystemMapEdge } from '@/hooks/useSystemMap';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// BFS to find shortest path
function findShortestPath(
  edges: SystemMapEdge[],
  startKey: string,
  endKey: string
): string[] {
  if (startKey === endKey) return [startKey];

  const adjacency: Record<string, string[]> = {};

  // Build undirected adjacency list
  edges.forEach((edge) => {
    if (!adjacency[edge.source_key]) adjacency[edge.source_key] = [];
    if (!adjacency[edge.target_key]) adjacency[edge.target_key] = [];
    adjacency[edge.source_key].push(edge.target_key);
    adjacency[edge.target_key].push(edge.source_key);
  });

  const queue: string[][] = [[startKey]];
  const visited = new Set<string>([startKey]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    const neighbors = adjacency[current] || [];
    for (const neighbor of neighbors) {
      if (neighbor === endKey) {
        return [...path, neighbor];
      }
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return [];
}

export default function SystemMap() {
  const { t } = useTranslation();
  const { data: nodes, isLoading: nodesLoading, error: nodesError } = useSystemMapNodes();
  const { data: edges, isLoading: edgesLoading, error: edgesError } = useSystemMapEdges();

  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [compareNodeKey, setCompareNodeKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [showOnlyCore, setShowOnlyCore] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const selectedNode = useMemo(
    () => nodes?.find((n) => n.key === selectedNodeKey) || null,
    [nodes, selectedNodeKey]
  );

  const shortestPath = useMemo(() => {
    if (!selectedNodeKey || !compareNodeKey || !edges) return [];
    return findShortestPath(edges, selectedNodeKey, compareNodeKey);
  }, [selectedNodeKey, compareNodeKey, edges]);

  const handleNodeSelect = useCallback((key: string | null) => {
    setSelectedNodeKey(key);
    if (!key) {
      setCompareNodeKey(null);
    }
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedNodeKey) {
      if (compareNodeKey === selectedNodeKey) {
        setCompareNodeKey(null);
      } else if (compareNodeKey) {
        // Swap selection to compare
        setCompareNodeKey(selectedNodeKey);
      } else {
        setCompareNodeKey(selectedNodeKey);
      }
    }
  }, [selectedNodeKey, compareNodeKey]);

  const isLoading = nodesLoading || edgesLoading;
  const error = nodesError || edgesError;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('systemMap.loadError')}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">{t('systemMap.title')}</h1>
          <p className="text-muted-foreground">{t('systemMap.subtitle')}</p>
        </div>

        <SystemMapFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          showOnlyCore={showOnlyCore}
          onShowOnlyCoreChange={setShowOnlyCore}
          editMode={editMode}
          onEditModeChange={setEditMode}
          existingKeys={nodes?.map((n) => n.key) || []}
          onNodeCreated={(key) => setSelectedNodeKey(key)}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <SystemMapGraph
              nodes={nodes || []}
              edges={edges || []}
              selectedNodeKey={selectedNodeKey}
              compareNodeKey={compareNodeKey}
              shortestPath={shortestPath}
              onNodeSelect={handleNodeSelect}
              editMode={editMode}
              searchTerm={searchTerm}
              categoryFilter={categoryFilter}
              showOnlyCore={showOnlyCore}
            />
          </div>

          {selectedNode && edges && nodes && (
            <SystemMapDetailPanel
              node={selectedNode}
              edges={edges}
              nodes={nodes}
              onClose={() => handleNodeSelect(null)}
              onCompare={handleCompare}
              compareNodeKey={compareNodeKey}
              shortestPath={shortestPath}
              editMode={editMode}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
