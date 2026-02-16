import { useState, useMemo } from 'react';
import { Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { COMMUNES, EPCIS } from '@/data/communes_2025';
import { usePortraitStore } from '@/store/usePortraitStore';

export function CommuneSelector() {
  const [search, setSearch] = useState('');
  const [filterEpci, setFilterEpci] = useState('');
  const { selectedCommune, setSelectedCommune } = usePortraitStore();

  const filtered = useMemo(() => {
    return COMMUNES.filter((c) => {
      const matchSearch = !search || c.nom_commune.toLowerCase().includes(search.toLowerCase()) || c.code_insee.includes(search);
      const matchEpci = !filterEpci || c.code_epci === filterEpci;
      return matchSearch && matchEpci;
    });
  }, [search, filterEpci]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une commune…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <select
          value={filterEpci}
          onChange={(e) => setFilterEpci(e.target.value)}
          className="h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground font-sans focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tous les EPCI</option>
          {EPCIS.map((e) => (
            <option key={e.code_epci} value={e.code_epci}>
              {e.sigle_epci} — {e.nom_epci}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
        {filtered.map((c) => (
          <button
            key={c.code_insee}
            onClick={() => setSelectedCommune(c.code_insee)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-left text-sm font-sans transition-all
              ${selectedCommune === c.code_insee
                ? 'bg-primary text-primary-foreground shadow-card'
                : 'bg-card hover:bg-secondary text-foreground border border-border'
              }`}
          >
            <Building2 className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <span className="truncate font-medium">{c.nom_commune}</span>
            <span className="ml-auto text-xs opacity-50">{c.code_insee}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground font-sans">
        {filtered.length} commune{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
      </p>
    </div>
  );
}
