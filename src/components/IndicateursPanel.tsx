import { Users, Home, Briefcase, TrendingUp, TrendingDown } from 'lucide-react';
import type { TerritoireIndicateurs } from '@/types';

interface Props {
  indicateurs: TerritoireIndicateurs;
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-card rounded-lg p-4 shadow-card border border-border">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-xs text-muted-foreground font-sans uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground font-serif">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export function IndicateursPanel({ indicateurs }: Props) {
  const fmt = (n: number | null) => n !== null ? n.toLocaleString('fr-FR') : 'N/D';
  const pct = (n: number | null) => n !== null ? `${n.toFixed(1)}%` : 'N/D';

  const EvIcon = (indicateurs.evolution_pop_pct ?? 0) >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground">Indicateurs clés</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Population 2021" value={fmt(indicateurs.population_2021)} />
        <StatCard icon={EvIcon} label="Évolution" value={pct(indicateurs.evolution_pop_pct)} sub="2016–2021" />
        <StatCard icon={Home} label="Logements" value={fmt(indicateurs.nb_logements_total)} />
        <StatCard icon={Home} label="Vacance" value={pct(indicateurs.taux_vacance_pct)} />
        <StatCard icon={Briefcase} label="Établissements" value={fmt(indicateurs.nb_etablissements_total)} />
        <StatCard icon={Briefcase} label="Agriculture" value={fmt(indicateurs.nb_etab_agriculture)} />
      </div>

      {indicateurs.erreurs.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-md p-3">
          <p className="text-xs font-sans text-warning font-medium">Avertissements :</p>
          <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
            {indicateurs.erreurs.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
