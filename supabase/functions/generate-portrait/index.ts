import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { indicateurs } = await req.json();
    const c = indicateurs.commune;

    const prompt = `Tu es urbaniste expert pour l'Agence d'urbanisme de Flandre. 
Rédige un portrait de territoire de 500 mots environ pour la commune de ${c.nom_commune} 
(code INSEE : ${c.code_insee}, département : ${c.nom_departement}).
Structure OBLIGATOIRE en 5 parties (avec titres en gras) :

**1. Positionnement territorial**
La commune appartient à ${c.nom_epci} (${c.sigle_epci}), dans le SCOT ${c.nom_scot || "non défini"}, 
axe ${c.axe || "non renseigné"}, département ${c.nom_departement}.

**2. Dynamique démographique**
Population 2021 : ${indicateurs.population_2021 ?? "donnée indisponible"} hab.
Population 2016 : ${indicateurs.population_2016 ?? "donnée indisponible"} hab.
Évolution : ${indicateurs.evolution_pop_pct !== null ? indicateurs.evolution_pop_pct.toFixed(1) + "%" : "N/D"}
Part des moins de 25 ans : ${indicateurs.part_moins_25 !== null ? indicateurs.part_moins_25.toFixed(1) + "%" : "N/D"}
Part des plus de 60 ans : ${indicateurs.part_plus_60 !== null ? indicateurs.part_plus_60.toFixed(1) + "%" : "N/D"}

**3. Diagnostic du parc de logements**
Total logements : ${indicateurs.nb_logements_total ?? "N/D"}
Résidences principales : ${indicateurs.nb_residences_principales ?? "N/D"}
Résidences secondaires : ${indicateurs.nb_residences_secondaires ?? "N/D"}
Logements vacants : ${indicateurs.nb_logements_vacants ?? "N/D"} (taux : ${indicateurs.taux_vacance_pct !== null ? indicateurs.taux_vacance_pct.toFixed(1) + "%" : "N/D"})
Part logement social : ${indicateurs.part_locatif_social_pct !== null ? indicateurs.part_locatif_social_pct.toFixed(1) + "%" : "N/D"}

**4. Tissu économique**
Établissements actifs : ${indicateurs.nb_etablissements_total ?? "N/D"}
Agriculture : ${indicateurs.nb_etab_agriculture ?? "N/D"} | Industrie : ${indicateurs.nb_etab_industrie ?? "N/D"}
Construction : ${indicateurs.nb_etab_construction ?? "N/D"} | Commerce : ${indicateurs.nb_etab_commerce ?? "N/D"}
Services : ${indicateurs.nb_etab_services ?? "N/D"}

**5. Enjeux et perspectives**
À partir des données ci-dessus, identifie 3 à 5 enjeux urbanistiques majeurs pour cette commune.

Utilise un ton professionnel, factuel, adapté à un document d'urbanisme. 
Intègre les chiffres dans le texte de manière fluide.
Si une donnée est "N/D", mentionne que l'information n'est pas disponible.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errText}`);
    }

    const result = await response.json();
    const texte = result.content?.[0]?.text || "Portrait non généré";

    return new Response(
      JSON.stringify({ texte }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
