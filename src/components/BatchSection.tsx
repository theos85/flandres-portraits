import { Download, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BatchJob } from '@/types';
import { getEpciBadgeVariant } from '@/lib/epci-utils';
import { COMMUNES } from '@/data/communes_2025';
import { useCallback } from 'react';

interface Props {
  batchJobs: BatchJob[];
}

export function BatchSection({ batchJobs }: Props) {
  const doneJobs = batchJobs.filter((j) => j.statut === 'done' && j.portrait);

  const handleExportAll = useCallback(() => {
    if (doneJobs.length === 0) return;
    const content = doneJobs
      .map((j) => `=== ${j.commune_nom} ===\n\n${j.portrait!.texte}`)
      .join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portraits_batch_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [doneJobs]);

  if (batchJobs.length === 0) return null;

  return (
    <div className="mt-4 bg-card rounded-lg shadow-card border border-border p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground font-serif">Génération en lot</h3>
        {doneJobs.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExportAll} className="font-sans text-xs">
            <Download className="mr-1 h-3.5 w-3.5" />
            Exporter tout (.txt)
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-sans text-xs">Commune</TableHead>
              <TableHead className="font-sans text-xs">EPCI</TableHead>
              <TableHead className="font-sans text-xs">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batchJobs.map((job) => {
              const commune = COMMUNES.find((c) => c.code_insee === job.commune_code);
              return (
                <TableRow key={job.commune_code}>
                  <TableCell className="font-sans text-sm font-medium">{job.commune_nom}</TableCell>
                  <TableCell>
                    {commune && (
                      <Badge variant={getEpciBadgeVariant(commune.sigle_epci)} className="text-[10px]">
                        {commune.sigle_epci}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge job={job} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {doneJobs.length}/{batchJobs.length} portraits générés
      </p>
    </div>
  );
}

function StatusBadge({ job }: { job: BatchJob }) {
  switch (job.statut) {
    case 'idle':
      return <Badge variant="gray">En attente</Badge>;
    case 'fetching_insee':
      return (
        <Badge variant="cud" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          INSEE…
        </Badge>
      );
    case 'generating_portrait':
      return (
        <Badge variant="default" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          IA…
        </Badge>
      );
    case 'done':
      return (
        <Badge variant="success" className="gap-1">
          <Check className="h-3 w-3" />
          Généré
        </Badge>
      );
    case 'error':
      return (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="destructive" className="gap-1">
              <X className="h-3 w-3" />
              Erreur
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs">
            {job.erreur || 'Erreur inconnue'}
          </TooltipContent>
        </Tooltip>
      );
    default:
      return null;
  }
}
