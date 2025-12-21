import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Edit, Eye, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { SystemMapNodeForm } from './SystemMapNodeForm';
import { NodeFormData } from './types';
import { useCreateNode } from '@/hooks/useSystemMap';

interface SystemMapFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string[];
  onCategoryFilterChange: (categories: string[]) => void;
  showOnlyCore: boolean;
  onShowOnlyCoreChange: (value: boolean) => void;
  editMode: boolean;
  onEditModeChange: (value: boolean) => void;
  existingKeys: string[];
  onNodeCreated?: (key: string) => void;
}

const categories = [
  { key: 'core', label: 'Core', color: 'bg-primary/10 text-primary border-primary/30' },
  { key: 'module', label: 'Module', color: 'bg-chart-2/10 text-chart-2 border-chart-2/30' },
  { key: 'ui', label: 'UI', color: 'bg-chart-3/10 text-chart-3 border-chart-3/30' },
  { key: 'security', label: 'Security', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  { key: 'automation', label: 'Automation', color: 'bg-chart-4/10 text-chart-4 border-chart-4/30' },
  { key: 'integration', label: 'Integration', color: 'bg-chart-5/10 text-chart-5 border-chart-5/30' },
];

export function SystemMapFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  showOnlyCore,
  onShowOnlyCoreChange,
  editMode,
  onEditModeChange,
  existingKeys,
  onNodeCreated,
}: SystemMapFiltersProps) {
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const createNode = useCreateNode();

  const toggleCategory = (category: string) => {
    if (categoryFilter.includes(category)) {
      onCategoryFilterChange(categoryFilter.filter((c) => c !== category));
    } else {
      onCategoryFilterChange([...categoryFilter, category]);
    }
  };

  const handleCreateSubmit = (data: NodeFormData) => {
    createNode.mutate(data, {
      onSuccess: (newNode) => {
        setShowCreateDialog(false);
        onNodeCreated?.(newNode.key);
      },
    });
  };

  return (
    <>
      <div className="p-4 border-b bg-card space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('systemMap.searchNodes')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <Badge
                key={cat.key}
                variant="outline"
                className={cn(
                  'cursor-pointer transition-all hover:opacity-80 border',
                  categoryFilter.includes(cat.key) && cat.color,
                  !categoryFilter.includes(cat.key) && 'opacity-50'
                )}
                onClick={() => toggleCategory(cat.key)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          {/* Show Only Core Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="core-only"
              checked={showOnlyCore}
              onCheckedChange={onShowOnlyCoreChange}
            />
            <Label htmlFor="core-only" className="text-sm cursor-pointer">
              {t('systemMap.coreOnly')}
            </Label>
          </div>

          {/* Edit Mode Toggle */}
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => onEditModeChange(!editMode)}
            className="gap-2"
          >
            {editMode ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {editMode ? t('systemMap.viewMode') : t('systemMap.editMode')}
          </Button>

          {/* Add Node Button (only in Edit Mode) */}
          {editMode && (
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('systemMap.addNode')}
            </Button>
          )}
        </div>
      </div>

      {/* Create Node Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('systemMap.createNode')}</DialogTitle>
          </DialogHeader>
          <SystemMapNodeForm
            mode="create"
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateDialog(false)}
            isSubmitting={createNode.isPending}
            existingKeys={existingKeys}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
