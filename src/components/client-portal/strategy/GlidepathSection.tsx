import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { riskProfiles } from './strategyData';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
  privacyMode?: boolean;
}

export function GlidepathSection({ selected, onSelect, privacyMode }: Props) {
  const profile = riskProfiles.find((r) => r.id === selected) ?? riskProfiles[0];

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Ablaufmanagement</h2>
          <p className="text-sm text-muted-foreground">
            Modellbasierte Betrachtung verschiedener Gewichtungen über die kommenden Altersjahre.
          </p>
        </div>
        <Badge variant="outline" className="text-xs w-fit">
          Modellübersicht: {profile.name.toLowerCase()}
        </Badge>
      </div>

      {/* Risk level tabs */}
      <div className="flex flex-wrap gap-2">
        {riskProfiles.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              selected === r.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* Glidepath table */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Assetklasse</TableHead>
                  {profile.rows.map((r) => (
                    <TableHead key={r.age} className="text-center min-w-[56px]">
                      {r.age}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-foreground">Aktien</TableCell>
                  {profile.rows.map((r) => (
                    <TableCell key={r.age} className="text-center">
                      {privacyMode ? (
                        <span className="text-xs text-muted-foreground">–</span>
                      ) : (
                        <span className={cn(
                          'inline-block text-xs font-mono px-2 py-0.5 rounded',
                          r.stocks >= 50
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground',
                        )}>
                          {r.stocks}%
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">Obligationen</TableCell>
                  {profile.rows.map((r) => (
                    <TableCell key={r.age} className="text-center">
                      {privacyMode ? (
                        <span className="text-xs text-muted-foreground">–</span>
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">{r.bonds}%</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">Liquidität</TableCell>
                  {profile.rows.map((r) => (
                    <TableCell key={r.age} className="text-center">
                      {privacyMode ? (
                        <span className="text-xs text-muted-foreground">–</span>
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">{r.liquidity}%</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
