import { useState, useMemo, useCallback } from 'react';
import { Search, Building2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { COMMUNES, EPCIS } from '@/data/communes_2025';
import { usePortraitStore } from '@/store/usePortraitStore';
import { getEpciBadgeVariant } from '@/lib/epci-utils';
import type { BatchJob } from '@/types';

interface Props {
  onGeneratePortrait: (communeCode: string) => void;
  onLaunchBatch: (epciCode: string) => void;
}

export function CommuneSidebar({ onGeneratePortrait, onLaunchBatch }: Props) {
  const [search, setSearch] = useState('');
  const { selectedCommune, setSelectedCommune, setSelectedEpci } = usePortraitStore();

  const filtered = useMemo(() => {
    if (!search) return COMMUNES;
    const q = search.toLowerCase();
    return COMMUNES.filter(
      (c) => c.nom_commune.toLowerCase().includes(q) || c.code_insee.includes(q)
    );
  }, [search]);

  const epciData = useMemo(() => {
    return EPCIS.map((e) => {
      const communes = COMMUNES.filter((c) => c.code_epci === e.code_epci);
      return { ...e, communes, count: communes.length };
    });
  }, []);

  const handleCommuneClick = useCallback((code: string) => {
    setSelectedCommune(code);
    onGeneratePortrait(code);
  }, [setSelectedCommune, onGeneratePortrait]);

  const handleBatchClick = useCallback((epciCode: string) => {
    setSelectedEpci(epciCode);
    onLaunchBatch(epciCode);
  }, [setSelectedEpci, onLaunchBatch]);

  return (
    <aside className="w-[280px] shrink-0 bg-card border-r border-border overflow-y-auto h-[calc(100vh-64px)]">
      <div className="p-4">
        <Tabs defaultValue="commune">
          <TabsList className="w-full">
            <TabsTrigger value="commune" className="flex-1 font-sans text-sm">Commune</TabsTrigger>
            <TabsTrigger value="epci" className="flex-1 font-sans text-sm">EPCI</TabsTrigger>
          </TabsList>

          <TabsContent value="commune" className="mt-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nom ou code INSEE…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">{filtered.length} commune{filtered.length > 1 ? 's' : ''}</p>
            <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.code_insee}
                  onClick={() => handleCommuneClick(c.code_insee)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left text-sm transition-all font-sans
                    ${selectedCommune === c.code_insee
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                    }`}
                >
                  <span className="font-medium truncate">{c.nom_commune}</span>
                  <Badge
                    variant={selectedCommune === c.code_insee ? 'outline' : getEpciBadgeVariant(c.sigle_epci)}
                    className="ml-2 text-[10px] px-1.5 py-0"
                  >
                    {c.sigle_epci}
                  </Badge>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="epci" className="mt-3 space-y-2">
            {epciData.map((e) => (
              <div
                key={e.code_epci}
                className="bg-secondary/50 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={getEpciBadgeVariant(e.sigle_epci)}>{e.sigle_epci}</Badge>
                  <span className="text-xs text-muted-foreground">{e.count} communes</span>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{e.nom_epci}</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="text-xs font-sans"
                    onClick={() => handleBatchClick(e.code_epci)}
                  >
                    <Building2 className="mr-1 h-3 w-3" />
                    Générer tout l'EPCI
                  </Button>
                </div>
                {e.count > 10 && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{e.count} communes — traitement long</span>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
