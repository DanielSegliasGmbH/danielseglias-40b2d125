import { useCallback, useEffect, useMemo } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { SystemMapNode, SystemMapEdge, useUpdateNodePosition } from '@/hooks/useSystemMap';
import { SystemMapNodeComponent } from './SystemMapNodeComponent';

const nodeTypes = {
  systemNode: SystemMapNodeComponent,
};

const categoryColors: Record<string, string> = {
  core: 'hsl(var(--primary))',
  module: 'hsl(var(--chart-2))',
  ui: 'hsl(var(--chart-3))',
  security: 'hsl(var(--destructive))',
  automation: 'hsl(var(--chart-4))',
  integration: 'hsl(var(--chart-5))',
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
  const updatePosition = useUpdateNodePosition();

  const filteredNodes = useMemo(() => {
    return rawNodes.filter((node) => {
      if (showOnlyCore && node.category !== 'core') return false;
      if (categoryFilter.length > 0 && !categoryFilter.includes(node.category)) return false;
      if (searchTerm && !node.label.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [rawNodes, showOnlyCore, categoryFilter, searchTerm]);

  const filteredNodeKeys = useMemo(() => new Set(filteredNodes.map((n) => n.key)), [filteredNodes]);

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

        return {
          id: edge.id,
          source: edge.source_key,
          target: edge.target_key,
          label: edge.relation,
          type: 'smoothstep',
          animated: isOnPath,
          style: {
            stroke: isOnPath
              ? 'hsl(var(--primary))'
              : isDirectConnection
              ? 'hsl(var(--chart-1))'
              : 'hsl(var(--muted-foreground))',
            strokeWidth: isOnPath ? 3 : isDirectConnection ? 2 : 1,
            opacity: selectedNodeKey && !isDirectConnection && !isOnPath ? 0.3 : 1,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isOnPath
              ? 'hsl(var(--primary))'
              : isDirectConnection
              ? 'hsl(var(--chart-1))'
              : 'hsl(var(--muted-foreground))',
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
            updatePosition.mutate({
              key: change.id,
              position_x: change.position.x,
              position_y: change.position.y,
            });
          }
        });
      }
    },
    [onNodesChange, editMode, updatePosition]
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
        nodeTypes={nodeTypes}
        nodesDraggable={editMode}
        nodesConnectable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        {editMode && (
          <Panel position="top-left" className="bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-sm font-medium">
            Edit Mode aktiv – Nodes verschiebbar
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
