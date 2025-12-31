import { PyramidItem, RelatedTopic } from '@/config/insurancePyramidConfig';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, 
  CheckCircle2, 
  FileX, 
  X,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailPanelProps {
  item: PyramidItem;
  onClose?: () => void;
  onTogglePrioritized: (itemId: string) => void;
  onToggleDiscussed: (itemId: string) => void;
  onAddWaiver: (itemId: string) => void;
  onToggleTopicDiscussed: (itemId: string, topicId: string) => void;
  showCloseButton?: boolean;
}

export function DetailPanel({
  item,
  onClose,
  onTogglePrioritized,
  onToggleDiscussed,
  onAddWaiver,
  onToggleTopicDiscussed,
  showCloseButton = false,
}: DetailPanelProps) {
  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            {item.isImportant && (
              <Badge variant="destructive" className="text-xs">
                Wichtiges Thema
              </Badge>
            )}
          </div>
        </div>
        {showCloseButton && onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={item.status.prioritized ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTogglePrioritized(item.id)}
              className="gap-2"
            >
              <Star className={cn('w-4 h-4', item.status.prioritized && 'fill-current')} />
              {item.status.prioritized ? 'Priorisiert' : 'Priorisieren'}
            </Button>
            <Button
              variant={item.status.discussed ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToggleDiscussed(item.id)}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {item.status.discussed ? 'Besprochen' : 'Als besprochen markieren'}
            </Button>
            <Button
              variant={item.status.waiver ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onAddWaiver(item.id)}
              className="gap-2"
            >
              <FileX className="w-4 h-4" />
              {item.status.waiver ? 'Verzicht erfasst' : 'Beratungsverzicht'}
            </Button>
          </div>

          <Separator />

          {/* Why Section */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Warum ist dieses Bedürfnis wichtig?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.whyText || 'Keine Beschreibung verfügbar.'}
            </p>
          </div>

          <Separator />

          {/* Related Topics */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Relevante Themen</h3>
            <div className="grid grid-cols-1 gap-2">
              {item.relatedTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onToggle={() => onToggleTopicDiscussed(item.id, topic.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

interface TopicCardProps {
  topic: RelatedTopic;
  onToggle: () => void;
}

function TopicCard({ topic, onToggle }: TopicCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        'p-3 cursor-pointer transition-all hover:shadow-md',
        'flex items-center justify-between gap-3',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        topic.discussed && 'border-primary/50 bg-primary/5'
      )}
    >
      <span className="text-sm font-medium">{topic.title}</span>
      {topic.discussed ? (
        <Badge variant="secondary" className="text-xs shrink-0">
          Angesprochen
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">
          Offen
        </Badge>
      )}
    </Card>
  );
}
