import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileText, Loader2, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COMMUNES } from '@/data/communes_2025';
import { usePortraitStore } from '@/store/usePortraitStore';
import { fetchInseeData, generatePortrait } from '@/services/api';
import { IndicateursPanel } from './IndicateursPanel';
import type { TerritoireIndicateurs } from '@/types';

export function PortraitView() {
  const { selectedCommune, statut, portrait, erreur, setStatut, setPortrait, setErreur } = usePortraitStore();

  const commune = COMMUNES.find((c) => c.code_insee === selectedCommune);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!commune) throw new Error('Commune non trouvée');

      setStatut('fetching_insee');
      setErreur(null);
      const indicateurs: TerritoireIndicateurs = await fetchInseeData(commune);

      setStatut('generating_portrait');
      const result = await generatePortrait(indicateurs);

      return result;
    },
    onSuccess: (result) => {
      setPortrait(result);
      setStatut('done');
    },
    onError: (err: Error) => {
      setErreur(err.message);
      setStatut('error');
    },
  });

  const handleGenerate = useCallback(() => {
    mutation.mutate();
  }, [mutation]);

  const handleExport = useCallback(() => {
    if (!portrait) return;
    const blob = new Blob([portrait.texte], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portrait_${portrait.commune_nom.replace(/\s/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [portrait]);

  if (!selectedCommune || !commune) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-sans">
          Sélectionnez une commune pour générer son portrait de territoire
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{commune.nom_commune}</h2>
          <p className="text-sm text-muted-foreground font-sans">
            {commune.sigle_epci} · {commune.code_postal} · INSEE {commune.code_insee}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={statut === 'fetching_insee' || statut === 'generating_portrait'}
            className="font-sans"
          >
            {statut === 'fetching_insee' && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Collecte INSEE…
              </>
            )}
            {statut === 'generating_portrait' && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rédaction IA…
              </>
            )}
            {(statut === 'idle' || statut === 'done' || statut === 'error') && (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Générer le portrait
              </>
            )}
          </Button>
          {portrait && (
            <Button variant="outline" onClick={handleExport} className="font-sans">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          )}
        </div>
      </div>

      {erreur && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Erreur</p>
            <p className="text-sm text-muted-foreground mt-1">{erreur}</p>
          </div>
        </div>
      )}

      {portrait && (
        <>
          <IndicateursPanel indicateurs={portrait.indicateurs} />

          <div className="bg-card rounded-lg border border-border p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Portrait de territoire</h3>
            <div className="prose prose-sm max-w-none text-foreground/90 font-sans leading-relaxed">
              {portrait.texte.split('\n').map((line, i) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <h4 key={i} className="text-base font-bold text-foreground mt-4 mb-2 font-serif">{line.replace(/\*\*/g, '')}</h4>;
                }
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="mb-2">{line}</p>;
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
              Généré le {new Date(portrait.date_generation).toLocaleDateString('fr-FR')} · Sources : {portrait.indicateurs.sources.join(', ')}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
