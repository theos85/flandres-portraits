import { useCallback } from 'react';
import { Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { PortraitGenere, StatutGeneration, TerritoireIndicateurs } from '@/types';
import { getEpciBadgeVariant } from '@/lib/epci-utils';
import { toast } from '@/hooks/use-toast';

interface Props {
  portrait: PortraitGenere | null;
  statut: StatutGeneration;
  indicateurs: TerritoireIndicateurs | null;
}

export function PortraitCard({ portrait, statut, indicateurs }: Props) {
  const handleCopy = useCallback(async () => {
    if (!portrait) return;
    await navigator.clipboard.writeText(portrait.texte);
    toast({ title: 'Copié !', description: 'Le portrait a été copié dans le presse-papier.' });
  }, [portrait]);

  const handleDownload = useCallback(() => {
    if (!portrait) return;
    const blob = new Blob([portrait.texte], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portrait_${portrait.commune_nom.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [portrait]);

  if (!portrait && statut !== 'generating_portrait') return null;

  const commune = portrait?.indicateurs?.commune || indicateurs?.commune;

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6 mt-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {commune && (
            <>
              <h3 className="text-lg font-semibold text-foreground font-serif">
                {commune.nom_commune}
                <Badge
                  variant={getEpciBadgeVariant(commune.sigle_epci)}
                  className="ml-2 align-middle"
                >
                  {commune.sigle_epci}
                </Badge>
              </h3>
            </>
          )}
        </div>
        {portrait && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="font-sans text-xs">
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copier
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="font-sans text-xs">
              <Download className="mr-1 h-3.5 w-3.5" />
              Télécharger
            </Button>
          </div>
        )}
      </div>

      {/* Skeleton while generating */}
      {statut === 'generating_portrait' && !portrait && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {/* Portrait content */}
      {portrait && (
        <>
          <div className="prose prose-sm max-w-none text-foreground/90 font-sans leading-relaxed">
            <ReactMarkdown>{portrait.texte}</ReactMarkdown>
          </div>

          {/* Partial data warning */}
          {portrait.indicateurs?.erreurs?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="warning">Données partielles</Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <ul className="text-xs space-y-1">
                    {portrait.indicateurs.erreurs.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
            Généré le {new Date(portrait.date_generation).toLocaleDateString('fr-FR')} · Sources : {portrait.indicateurs.sources.join(', ')}
          </p>
        </>
      )}
    </div>
  );
}
