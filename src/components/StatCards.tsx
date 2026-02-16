import { TrendingUp, TrendingDown, Home, Briefcase, Users, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { TerritoireIndicateurs } from '@/types';

interface Props {
  indicateurs: TerritoireIndicateurs | null;
  loading: boolean;
}

export function StatCards({ indicateurs, loading }: Props) {
  if (loading || !indicateurs) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const fmt = (n: number | null) => (n !== null ? n.toLocaleString('fr-FR') : 'N/D');
  const pct = (n: number | null) => (n !== null ? `${n.toFixed(1)}%` : 'N/D');
  const evol = indicateurs.evolution_pop_pct;
  const EvIcon = (evol ?? 0) >= 0 ? TrendingUp : TrendingDown;
  const evolColor = evol !== null ? (evol > 0 ? 'text-emerald-600' : evol < 0 ? 'text-red-500' : 'text-muted-foreground') : 'text-muted-foreground';

  const vacance = indicateurs.taux_vacance_pct;
  const vacanceBadge = vacance !== null
    ? vacance < 5 ? 'success' as const : vacance < 10 ? 'warning' as const : 'destructive' as const
    : 'secondary' as const;

  const rpPct = indicateurs.nb_logements_total && indicateurs.nb_residences_principales
    ? (indicateurs.nb_residences_principales / indicateurs.nb_logements_total) * 100 : 0;
  const rsPct = indicateurs.nb_logements_total && indicateurs.nb_residences_secondaires
    ? (indicateurs.nb_residences_secondaires / indicateurs.nb_logements_total) * 100 : 0;
  const vacPct = indicateurs.nb_logements_total && indicateurs.nb_logements_vacants
    ? (indicateurs.nb_logements_vacants / indicateurs.nb_logements_total) * 100 : 0;

  const secteurs = [
    { label: 'Agriculture', value: indicateurs.nb_etab_agriculture },
    { label: 'Industrie', value: indicateurs.nb_etab_industrie },
    { label: 'Construction', value: indicateurs.nb_etab_construction },
    { label: 'Commerce', value: indicateurs.nb_etab_commerce },
    { label: 'Services', value: indicateurs.nb_etab_services },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      {/* Population */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide font-sans">Population 2021</span>
          </div>
          <p className="text-3xl font-bold text-foreground font-serif">
            {fmt(indicateurs.population_2021)}
          </p>
          <div className={`flex items-center gap-1 mt-1 text-sm ${evolColor}`}>
            <EvIcon className="h-4 w-4" />
            <span className="font-medium">{pct(evol)}</span>
            <span className="text-muted-foreground text-xs ml-1">vs 2016</span>
          </div>
        </CardContent>
      </Card>

      {/* Logements */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Home className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide font-sans">Logements</span>
          </div>
          <p className="text-3xl font-bold text-foreground font-serif">
            {fmt(indicateurs.nb_logements_total)}
          </p>
          <div className="mt-2 space-y-1">
            <MiniBar label="RP" pct={rpPct} color="bg-primary" />
            <MiniBar label="RS" pct={rsPct} color="bg-accent" />
            <MiniBar label="Vacants" pct={vacPct} color="bg-destructive/70" />
          </div>
        </CardContent>
      </Card>

      {/* Taux vacance */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Home className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide font-sans">Taux vacance</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-foreground font-serif">
              {pct(vacance)}
            </p>
            <Badge variant={vacanceBadge}>
              {vacance !== null ? (vacance < 5 ? 'Faible' : vacance < 10 ? 'Modéré' : 'Élevé') : '—'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Établissements */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Briefcase className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide font-sans">Établissements</span>
          </div>
          <p className="text-3xl font-bold text-foreground font-serif">
            {fmt(indicateurs.nb_etablissements_total)}
          </p>
          <div className="mt-2 space-y-1">
            {secteurs.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-xs font-sans">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium text-foreground">{fmt(s.value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logement social */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Percent className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide font-sans">Logement social</span>
          </div>
          <p className="text-3xl font-bold text-foreground font-serif">
            {pct(indicateurs.part_locatif_social_pct)}
          </p>
          <Progress
            value={indicateurs.part_locatif_social_pct ?? 0}
            className="mt-2 h-2"
          />
        </CardContent>
      </Card>

      {/* Évolution démo */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide font-sans">Évolution démo</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <span className="text-lg font-serif">{fmt(indicateurs.population_2016)}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-lg font-bold font-serif">{fmt(indicateurs.population_2021)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">2016 → 2021</p>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-sans">
      <span className="w-12 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="w-10 text-right text-muted-foreground">{pct.toFixed(0)}%</span>
    </div>
  );
}
