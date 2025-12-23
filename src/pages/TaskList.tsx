import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardList, Search } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const PRIORITY_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  niedrig: 'outline',
  mittel: 'secondary',
  hoch: 'default',
  dringend: 'destructive',
};

export default function TaskList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          case:cases!fk_tasks_case_id(
            id,
            title,
            customer:customers!cases_customer_id_fkey(id, first_name, last_name)
          )
        `)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('priority', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.case?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${task.case?.customer?.first_name} ${task.case?.customer?.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '–';
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de });
  };

  const handleRowClick = (caseId: string) => {
    navigate(`/app/cases/${caseId}`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {t('task.title')}
            </h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('app.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('table.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('task.all')}</SelectItem>
                <SelectItem value="offen">{t('task.statuses.offen')}</SelectItem>
                <SelectItem value="in_arbeit">{t('task.statuses.in_arbeit')}</SelectItem>
                <SelectItem value="erledigt">{t('task.statuses.erledigt')}</SelectItem>
                <SelectItem value="blockiert">{t('task.statuses.blockiert')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('task.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : filteredTasks?.length === 0 ? (
                <p className="text-muted-foreground py-4">{t('task.noTasks')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('table.title')}</TableHead>
                      <TableHead>{t('task.caseClient')}</TableHead>
                      <TableHead>{t('table.priority')}</TableHead>
                      <TableHead>{t('table.due')}</TableHead>
                      <TableHead>{t('table.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks?.map((task) => (
                      <TableRow
                        key={task.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => task.case?.id && handleRowClick(task.case.id)}
                      >
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell>
                          {task.case?.title}
                          <span className="text-muted-foreground ml-2">
                            ({task.case?.customer?.first_name} {task.case?.customer?.last_name})
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={PRIORITY_VARIANTS[task.priority] || 'secondary'}>
                            {t(`task.priorities.${task.priority}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(task.due_date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{t(`task.statuses.${task.status}`)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AppLayout>
  );
}
