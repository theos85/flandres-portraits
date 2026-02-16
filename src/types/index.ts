export interface TerritoireIndicateurs {
  commune: import('../data/communes_2025').Commune;
  population_2021: number | null;
  population_2016: number | null;
  evolution_pop_pct: number | null;
  part_moins_25: number | null;
  part_plus_60: number | null;
  nb_logements_total: number | null;
  nb_residences_principales: number | null;
  nb_residences_secondaires: number | null;
  nb_logements_vacants: number | null;
  taux_vacance_pct: number | null;
  part_locatif_social_pct: number | null;
  nb_etablissements_total: number | null;
  nb_etab_agriculture: number | null;
  nb_etab_industrie: number | null;
  nb_etab_construction: number | null;
  nb_etab_commerce: number | null;
  nb_etab_services: number | null;
  date_collecte: string;
  sources: string[];
  erreurs: string[];
}

export interface PortraitGenere {
  commune_code: string;
  commune_nom: string;
  texte: string;
  indicateurs: TerritoireIndicateurs;
  date_generation: string;
}

export type StatutGeneration = 'idle' | 'fetching_insee' | 'generating_portrait' | 'done' | 'error';

export interface BatchJob {
  commune_code: string;
  commune_nom: string;
  statut: StatutGeneration;
  portrait?: PortraitGenere;
  erreur?: string;
}
