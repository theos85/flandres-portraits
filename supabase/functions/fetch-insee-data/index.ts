import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const INSEE_TOKEN = Deno.env.get("INSEE_TOKEN")!;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { code_insee } = await req.json();
    if (!code_insee) throw new Error("code_insee requis");

    const headers = {
      Authorization: `Bearer ${INSEE_TOKEN}`,
      Accept: "application/json",
    };

    const popUrl2021 = `https://api.insee.fr/melodi/data/DS_RP_POPULATION_PRINC?GEO=COM-${code_insee}&TIME_PERIOD=2021&maxResult=200`;
    const popUrl2016 = `https://api.insee.fr/melodi/data/DS_RP_POPULATION_PRINC?GEO=COM-${code_insee}&TIME_PERIOD=2016&maxResult=200`;
    const logUrl = `https://api.insee.fr/melodi/data/DS_RP_LOGEMENT_PRINC?GEO=COM-${code_insee}&TIME_PERIOD=2021&maxResult=200`;
    const sireneBase = `https://api.insee.fr/api-sirene/3.11/etablissement`;
    const sireneUrl = `${sireneBase}?q=communeEtablissement:${code_insee} AND etatAdministratifEtablissement:A&nombre=1&champs=activitePrincipaleEtablissement`;

    const [popResp2021, popResp2016, logResp, sireneResp] = await Promise.allSettled([
      fetch(popUrl2021, { headers }),
      fetch(popUrl2016, { headers }),
      fetch(logUrl, { headers }),
      fetch(sireneUrl, { headers }),
    ]);

    const popData2021 = popResp2021.status === "fulfilled" && popResp2021.value.ok
      ? await popResp2021.value.json() : null;
    const popData2016 = popResp2016.status === "fulfilled" && popResp2016.value.ok
      ? await popResp2016.value.json() : null;
    const logData = logResp.status === "fulfilled" && logResp.value.ok
      ? await logResp.value.json() : null;
    const sireneData = sireneResp.status === "fulfilled" && sireneResp.value.ok
      ? await sireneResp.value.json() : null;

    const sectorCounts: Record<string, number> = {};
    if (sireneData?.header?.total) {
      const sections = [
        { key: "agriculture", codes: ["A"] },
        { key: "industrie", codes: ["B", "C", "D", "E"] },
        { key: "construction", codes: ["F"] },
        { key: "commerce", codes: ["G"] },
        { key: "services", codes: ["H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"] },
      ];
      for (const s of sections) {
        let total = 0;
        for (const c of s.codes) {
          try {
            const r = await fetch(
              `${sireneBase}?q=communeEtablissement:${code_insee} AND etatAdministratifEtablissement:A AND activitePrincipaleEtablissement:${c}*&nombre=1`,
              { headers }
            );
            if (r.ok) {
              const d = await r.json();
              total += d?.header?.total ?? 0;
            }
          } catch {
            // skip
          }
        }
        sectorCounts[s.key] = total;
      }
    }

    return new Response(
      JSON.stringify({
        population: { annee2021: popData2021, annee2016: popData2016 },
        logement: logData,
        sirene: {
          totalBrut: sireneData?.header?.total ?? null,
          secteurs: sectorCounts,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
