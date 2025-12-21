import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeChange,
  MarkerType,
  Panel,
  Connection,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { toast } from 'sonner';
import { SystemMapNode, SystemMapEdge, useDebouncedPositionUpdate, useCreateEdge } from '@/hooks/useSystemMap';
import { SystemMapNodeComponent } from './SystemMapNodeComponent';
import { SystemMapEdgeForm } from './SystemMapEdgeForm';
import { categoryColors, EdgeRelation } from './types';

const nodeTypes = {
  systemNode: SystemMapNodeComponent,
};

// Edge styles based on relation type
const getEdgeStyle = (relation: string, isOnPath: boolean, isDirectConnection: boolean, selectedNodeKey: string | null) => {
  const baseStyle = {
    stroke: isOnPath
      ? 'hsl(var(--primary))'
      : isDirectConnection
      ? 'hsl(var(--chart-1))'
      : 'hsl(var(--muted-foreground))',
    opacity: selectedNodeKey && !isDirectConnection && !isOnPath ? 0.3 : 1,
  };

  // Relation-specific styles
  switch (relation) {
    case 'depends_on':
      return {
        ...baseStyle,
        strokeWidth: isOnPath ? 3 : isDirectConnection ? 2 : 1.5,
        strokeDasharray: '5 3',
      };
    case 'owns':
    case 'contains':
      return {
        ...baseStyle,
        strokeWidth: isOnPath ? 4 : isDirectConnection ? 3 : 2.5,
      };
    case 'creates':
      return {
        ...baseStyle,
        strokeWidth: isOnPath ? 3 : isDirectConnection ? 2 : 1.5,
        strokeDasharray: '3 2',
      };
    default: // uses, manages
      return {
        ...baseStyle,
        strokeWidth: isOnPath ? 3 : isDirectConnection ? 2 : 1.5,
      };
  }
};

interface SystemMapGraphProps {
  nodes: SystemMapNode[];
  edges: SystemMapEdge[];
  selectedNodeKey: string | null;
  compareNodeKey: string | null;
  shortestPath: string[];
  onNodeSelect: (key: string | null) => void;
  editMode: boolean;
  searchTerm: string;
  categoryFilter: string[];
  showOnlyCore: boolean;
}

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 180;
  const nodeHeight = 60;

  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const posX = node.data.position_x as number | null;
    const posY = node.data.position_y as number | null;
    return {
      ...node,
      position: {
        x: posX ?? nodeWithPosition.x - nodeWidth / 2,
        y: posY ?? nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function SystemMapGraph({
  nodes: rawNodes,
  edges: rawEdges,
  selectedNodeKey,
  compareNodeKey,
  shortestPath,
  onNodeSelect,
  editMode,
  searchTerm,
  categoryFilter,
  showOnlyCore,
}: SystemMapGraphProps) {
  const { t } = useTranslation();
  const { debouncedUpdate: updatePosition } = useDebouncedPositionUpdate();
  const createEdge = useCreateEdge();

  // State for edge creation modal
  const [pendingConnection, setPendingConnection] = useState<{
    source: string;
    target: string;
    sourceLabel: string;
    targetLabel: string;
  } | null>(null);

  const filteredNodes = useMemo(() => {
    return rawNodes.filter((node) => {
      if (showOnlyCore && node.category !== 'core') return false;
      if (categoryFilter.length > 0 && !categoryFilter.includes(node.category)) return false;
      if (searchTerm && !node.label.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [rawNodes, showOnlyCore, categoryFilter, searchTerm]);

  const filteredNodeKeys = useMemo(() => new Set(filteredNodes.map((n) => n.key)), [filteredNodes]);

  const nodeKeyToLabel = useMemo(() => {
    const map: Record<string, string> = {};
    rawNodes.forEach((n) => {
      map[n.key] = n.label;
    });
    return map;
  }, [rawNodes]);

  const flowNodes: Node[] = useMemo(() => {
    return filteredNodes.map((node) => ({
      id: node.key,
      type: 'systemNode',
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        category: node.category,
        description: node.description,
        position_x: node.position_x,
        position_y: node.position_y,
        isSelected: node.key === selectedNodeKey,
        isCompare: node.key === compareNodeKey,
        isOnPath: shortestPath.includes(node.key),
        color: categoryColors[node.category] || 'hsl(var(--muted-foreground))',
      },
    }));
  }, [filteredNodes, selectedNodeKey, compareNodeKey, shortestPath]);

  const flowEdges: Edge[] = useMemo(() => {
    return rawEdges
      .filter((edge) => filteredNodeKeys.has(edge.source_key) && filteredNodeKeys.has(edge.target_key))
      .map((edge) => {
        const isOnPath =
          shortestPath.length > 1 &&
          shortestPath.some((key, i) => {
            const nextKey = shortestPath[i + 1];
            return (
              (edge.source_key === key && edge.target_key === nextKey) ||
              (edge.target_key === key && edge.source_key === nextKey)
            );
          });

        const isDirectConnection =
          selectedNodeKey &&
          (edge.source_key === selectedNodeKey || edge.target_key === selectedNodeKey);

        const edgeStyle = getEdgeStyle(edge.relation, isOnPath, !!isDirectConnection, selectedNodeKey);

        return {
          id: edge.id,
          source: edge.source_key,
          target: edge.target_key,
          label: edge.relation,
          type: 'smoothstep',
          animated: isOnPath,
          style: edgeStyle,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeStyle.stroke,
          },
          labelStyle: {
            fontSize: 10,
            fill: 'hsl(var(--muted-foreground))',
          },
          labelBgStyle: {
            fill: 'hsl(var(--background))',
            fillOpacity: 0.8,
          },
        };
      });
  }, [rawEdges, filteredNodeKeys, selectedNodeKey, shortestPath]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(flowNodes, flowEdges, 'TB'),
    [flowNodes, flowEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      onNodesChange(changes);

      if (editMode) {
        changes.forEach((change) => {
          if (change.type === 'position' && change.dragging === false && change.position) {
            updatePosition(change.id, change.position.x, change.position.y);
          }
        });
      }
    },
    [onNodesChange, editMode, updatePosition]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!editMode) return;

      const { source, target } = connection;
      if (!source || !target) return;

      // Block self-edges
      if (source === target) {
        toast.error(t('systemMap.selfEdgeError'));
        return;
      }

      // Open modal to select relation
      setPendingConnection({
        source,
        target,
        sourceLabel: nodeKeyToLabel[source] || source,
        targetLabel: nodeKeyToLabel[target] || target,
      });
    },
    [editMode, nodeKeyToLabel, t]
  );

  const handleEdgeSubmit = useCallback(
    (relation: EdgeRelation) => {
      if (!pendingConnection) return;

      createEdge.mutate(
        {
          source_key: pendingConnection.source,
          target_key: pendingConnection.target,
          relation,
        },
        {
          onSuccess: () => {
            setPendingConnection(null);
          },
        }
      );
    },
    [pendingConnection, createEdge]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id === selectedNodeKey ? null : node.id);
    },
    [onNodeSelect, selectedNodeKey]
  );

  const handlePaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={editMode}
        nodesConnectable={editMode}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        {editMode && (
          <Panel position="top-left" className="bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-sm font-medium">
            Edit Mode aktiv – Nodes verschiebbar, Edges erstellbar
          </Panel>
        )}
      </ReactFlow>

      {pendingConnection && (
        <SystemMapEdgeForm
          open={!!pendingConnection}
          onOpenChange={(open) => !open && setPendingConnection(null)}
          sourceKey={pendingConnection.source}
          targetKey={pendingConnection.target}
          sourceLabel={pendingConnection.sourceLabel}
          targetLabel={pendingConnection.targetLabel}
          onSubmit={handleEdgeSubmit}
          isPending={createEdge.isPending}
        />
      )}
    </div>
  );
}
