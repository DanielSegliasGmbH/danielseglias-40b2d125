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
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Ablaufmanagement</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
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
        <CardContent className="p-2 sm:p-4 md:p-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <Table className="min-w-[420px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 w-20 sm:w-28 text-[11px] sm:text-sm">
                    Alter
                  </TableHead>
                  {profile.rows.map((r) => (
                    <TableHead key={r.age} className="text-center min-w-[44px] sm:min-w-[56px] text-[11px] sm:text-sm px-1 sm:px-2">
                      {r.age}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium text-foreground text-[11px] sm:text-sm">Aktien</TableCell>
                  {profile.rows.map((r) => (
                    <TableCell key={r.age} className="text-center px-1 sm:px-2">
                      {privacyMode ? (
                        <span className="text-[11px] text-muted-foreground">–</span>
                      ) : (
                        <span className={cn(
                          'inline-block text-[11px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 rounded',
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
                  <TableCell className="sticky left-0 bg-card z-10 font-medium text-foreground text-[11px] sm:text-sm">Obligationen</TableCell>
                  {profile.rows.map((r) => (
                    <TableCell key={r.age} className="text-center px-1 sm:px-2">
                      {privacyMode ? (
                        <span className="text-[11px] text-muted-foreground">–</span>
                      ) : (
                        <span className="text-[11px] sm:text-xs font-mono text-muted-foreground">{r.bonds}%</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium text-foreground text-[11px] sm:text-sm">Liquidität</TableCell>
                  {profile.rows.map((r) => (
                    <TableCell key={r.age} className="text-center px-1 sm:px-2">
                      {privacyMode ? (
                        <span className="text-[11px] text-muted-foreground">–</span>
                      ) : (
                        <span className="text-[11px] sm:text-xs font-mono text-muted-foreground">{r.liquidity}%</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 sm:hidden text-center">
            ← horizontal scrollen →
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
