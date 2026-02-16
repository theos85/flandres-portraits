import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { StatutGeneration } from '@/types';

interface Props {
  statut: StatutGeneration;
}

export function ProgressBar({ statut }: Props) {
  if (statut === 'idle' || statut === 'done') return null;

  const label = statut === 'fetching_insee' ? 'Interrogation INSEE…' : 'Génération du portrait IA…';
  const value = statut === 'fetching_insee' ? 40 : 75;

  return (
    <div className="mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm font-sans text-muted-foreground">{label}</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
