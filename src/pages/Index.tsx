import { useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppHeader } from '@/components/AppHeader';
import { CommuneSidebar } from '@/components/CommuneSidebar';
import { StatCards } from '@/components/StatCards';
import { PortraitCard } from '@/components/PortraitCard';
import { BatchSection } from '@/components/BatchSection';
import { ProgressBar } from '@/components/ProgressBar';
import { usePortraitStore } from '@/store/usePortraitStore';
import { COMMUNES } from '@/data/communes_2025';
import { fetchInseeData, generatePortrait } from '@/services/api';
import type { BatchJob } from '@/types';

const Index = () => {
  const {
    statut, portrait, indicateurs, erreur, batchJobs,
    setStatut, setPortrait, setIndicateurs, setErreur,
    setSelectedCommune, setBatchJobs, updateBatchJob,
    retryCount, incrementRetry, resetRetry,
  } = usePortraitStore();

  const genererPortrait = useCallback(async (communeCode: string) => {
    const commune = COMMUNES.find((c) => c.code_insee === communeCode);
    if (!commune) return;

    setSelectedCommune(communeCode);
    setErreur(null);
    resetRetry();

    try {
      setStatut('fetching_insee');
      const ind = await fetchInseeData(commune);
      setIndicateurs(ind);

      setStatut('generating_portrait');
      const result = await generatePortrait(ind);
      setPortrait(result);
      setStatut('done');
    } catch (err: any) {
      const msg = err?.message || 'Erreur inconnue';
      setErreur(msg);
      setStatut('error');

      // Retry on 429
      if (msg.includes('429') && retryCount < 2) {
        incrementRetry();
        setTimeout(() => genererPortrait(communeCode), 5000);
      }
    }
  }, [setStatut, setPortrait, setIndicateurs, setErreur, setSelectedCommune, resetRetry, retryCount, incrementRetry]);

  const lancerBatch = useCallback(async (epciCode: string) => {
    const communes = COMMUNES.filter((c) => c.code_epci === epciCode);
    const jobs: BatchJob[] = communes.map((c) => ({
      commune_code: c.code_insee,
      commune_nom: c.nom_commune,
      statut: 'idle',
    }));
    setBatchJobs(jobs);

    for (const commune of communes) {
      updateBatchJob(commune.code_insee, { statut: 'fetching_insee' });

      try {
        const ind = await fetchInseeData(commune);
        updateBatchJob(commune.code_insee, { statut: 'generating_portrait' });

        const result = await generatePortrait(ind);
        updateBatchJob(commune.code_insee, { statut: 'done', portrait: result });
      } catch (err: any) {
        const msg = err?.message || 'Erreur inconnue';
        let retried = false;

        if (msg.includes('429')) {
          // Wait and retry once
          await new Promise((r) => setTimeout(r, 5000));
          try {
            const ind = await fetchInseeData(commune);
            updateBatchJob(commune.code_insee, { statut: 'generating_portrait' });
            const result = await generatePortrait(ind);
            updateBatchJob(commune.code_insee, { statut: 'done', portrait: result });
            retried = true;
          } catch (e2: any) {
            updateBatchJob(commune.code_insee, { statut: 'error', erreur: e2?.message || msg });
          }
        }

        if (!retried && !msg.includes('429')) {
          updateBatchJob(commune.code_insee, { statut: 'error', erreur: msg });
        }
      }
    }
  }, [setBatchJobs, updateBatchJob]);

  const isLoading = statut === 'fetching_insee' || statut === 'generating_portrait';

  return (
    <div className="min-h-screen bg-muted/50 flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <CommuneSidebar onGeneratePortrait={genererPortrait} onLaunchBatch={lancerBatch} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1100px] mx-auto space-y-4">
            <ProgressBar statut={statut} />

            {erreur && (
              <Alert variant="destructive" className="animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription className="font-sans text-sm">{erreur}</AlertDescription>
              </Alert>
            )}

            <StatCards indicateurs={indicateurs} loading={isLoading && !indicateurs} />

            <PortraitCard portrait={portrait} statut={statut} indicateurs={indicateurs} />

            <BatchSection batchJobs={batchJobs} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
