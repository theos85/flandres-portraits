import { supabase } from '@/integrations/supabase/client';
import type { Commune } from '@/data/communes_2025';
import type { TerritoireIndicateurs, PortraitGenere } from '@/types';

export async function fetchInseeData(commune: Commune): Promise<TerritoireIndicateurs> {
  const { data, error } = await supabase.functions.invoke('fetch-insee-data', {
    body: { code_insee: commune.code_insee },
  });

  if (error) throw new Error(`Erreur INSEE: ${error.message}`);

  const erreurs: string[] = [];
  const sources: string[] = [];

  // Parse population data
  let population_2021: number | null = null;
  let population_2016: number | null = null;
  let part_moins_25: number | null = null;
  let part_plus_60: number | null = null;

  if (data?.population?.annee2021) {
    sources.push('INSEE RP 2021');
    try {
      const obs = data.population.annee2021?.observations || data.population.annee2021?.dataSets?.[0]?.observations || {};
      // Try to extract total population from SDMX response
      const popTotal = extractPopulationTotal(data.population.annee2021);
      if (popTotal !== null) population_2021 = popTotal;
    } catch {
      erreurs.push('Erreur parsing population 2021');
    }
  } else {
    erreurs.push('Population 2021 indisponible');
  }

  if (data?.population?.annee2016) {
    try {
      const popTotal = extractPopulationTotal(data.population.annee2016);
      if (popTotal !== null) population_2016 = popTotal;
    } catch {
      erreurs.push('Erreur parsing population 2016');
    }
  }

  const evolution_pop_pct = population_2021 !== null && population_2016 !== null && population_2016 > 0
    ? ((population_2021 - population_2016) / population_2016) * 100
    : null;

  // Parse logement data
  let nb_logements_total: number | null = null;
  let nb_residences_principales: number | null = null;
  let nb_residences_secondaires: number | null = null;
  let nb_logements_vacants: number | null = null;
  let taux_vacance_pct: number | null = null;
  let part_locatif_social_pct: number | null = null;

  if (data?.logement) {
    sources.push('INSEE RP Logement 2021');
  } else {
    erreurs.push('Données logement indisponibles');
  }

  // Parse Sirene data
  let nb_etablissements_total: number | null = null;
  let nb_etab_agriculture: number | null = null;
  let nb_etab_industrie: number | null = null;
  let nb_etab_construction: number | null = null;
  let nb_etab_commerce: number | null = null;
  let nb_etab_services: number | null = null;

  if (data?.sirene) {
    sources.push('INSEE Sirene');
    nb_etablissements_total = data.sirene.totalBrut;
    const s = data.sirene.secteurs || {};
    nb_etab_agriculture = s.agriculture ?? null;
    nb_etab_industrie = s.industrie ?? null;
    nb_etab_construction = s.construction ?? null;
    nb_etab_commerce = s.commerce ?? null;
    nb_etab_services = s.services ?? null;
  }

  if (nb_logements_vacants !== null && nb_logements_total !== null && nb_logements_total > 0) {
    taux_vacance_pct = (nb_logements_vacants / nb_logements_total) * 100;
  }

  return {
    commune,
    population_2021,
    population_2016,
    evolution_pop_pct,
    part_moins_25,
    part_plus_60,
    nb_logements_total,
    nb_residences_principales,
    nb_residences_secondaires,
    nb_logements_vacants,
    taux_vacance_pct,
    part_locatif_social_pct,
    nb_etablissements_total,
    nb_etab_agriculture,
    nb_etab_industrie,
    nb_etab_construction,
    nb_etab_commerce,
    nb_etab_services,
    date_collecte: new Date().toISOString(),
    sources,
    erreurs,
  };
}

export async function generatePortrait(indicateurs: TerritoireIndicateurs): Promise<PortraitGenere> {
  const { data, error } = await supabase.functions.invoke('generate-portrait', {
    body: { indicateurs },
  });

  if (error) throw new Error(`Erreur génération: ${error.message}`);

  return {
    commune_code: indicateurs.commune.code_insee,
    commune_nom: indicateurs.commune.nom_commune,
    texte: data?.texte || data?.portrait || 'Portrait non généré',
    indicateurs,
    date_generation: new Date().toISOString(),
  };
}

function extractPopulationTotal(sdmxData: any): number | null {
  try {
    // Try multiple SDMX response formats
    if (sdmxData?.dataSets?.[0]?.observations) {
      const obs = sdmxData.dataSets[0].observations;
      // Sum or find total observation
      const values = Object.values(obs) as number[][];
      if (values.length > 0) {
        // Find the total (usually first or the one with AGE=_T)
        const total = values.reduce((sum, v) => sum + (v[0] || 0), 0);
        return Math.round(total);
      }
    }
    if (sdmxData?.dataSets?.[0]?.series) {
      const series = sdmxData.dataSets[0].series;
      let total = 0;
      for (const key of Object.keys(series)) {
        const obs = series[key]?.observations;
        if (obs) {
          for (const val of Object.values(obs) as number[][]) {
            total += val[0] || 0;
          }
        }
      }
      if (total > 0) return Math.round(total);
    }
    return null;
  } catch {
    return null;
  }
}
