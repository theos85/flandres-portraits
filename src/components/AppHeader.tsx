import { Badge } from '@/components/ui/badge';
import { usePortraitStore } from '@/store/usePortraitStore';
import { COMMUNES } from '@/data/communes_2025';
import { getEpciBadgeVariant } from '@/lib/epci-utils';

export function AppHeader() {
  const { selectedCommune, selectedEpci } = usePortraitStore();

  const commune = selectedCommune ? COMMUNES.find((c) => c.code_insee === selectedCommune) : null;
  const activeEpci = commune?.sigle_epci || (selectedEpci ? COMMUNES.find(c => c.code_epci === selectedEpci)?.sigle_epci : null);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-card px-6 py-3">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div>
          <h1 className="text-xl font-bold text-primary font-serif">
            Portraits de Territoire — Flandre
          </h1>
          <p className="text-sm text-muted-foreground font-sans">
            Observatoire urbain de l'AGUR
          </p>
        </div>
        {activeEpci && (
          <Badge variant={getEpciBadgeVariant(activeEpci)} className="text-sm px-3 py-1">
            {activeEpci}
          </Badge>
        )}
      </div>
    </header>
  );
}
