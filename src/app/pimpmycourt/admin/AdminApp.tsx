"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseAuth } from "@/lib/pmc/supabaseAuthClient";
import { ADMIN_EMAIL } from "@/lib/pmc/admin";
import { satelliteImageUrl } from "@/lib/pmc/satellite";
import { ETAT_COLOR } from "@/lib/pmc/types";

// Lazy-load the MapLibre admin map only when the Carte section is opened.
const AdminMap = dynamic(() => import("./AdminMap"), {
  ssr: false,
  loading: () => <p className="text-white/40 text-center py-10">Chargement de la carte…</p>,
});

type QueueItem = {
  id: string;
  latitude: number;
  longitude: number;
  ville: string | null;
  departement: string | null;
  nb_confirmations: number;
  nb_paniers: number | null;
  nb_filets_a_remplacer: number | null;
  nom_terrain: string | null;
  nom: string | null;
  age: number | null;
  contact_email: string | null;
  contact_instagram: string | null;
  contact_tiktok: string | null;
  prenom: string | null;
  commentaire: string | null;
  merge_candidate: { id: string; ville: string | null; statut: string; distance: number } | null;
};

export default function AdminApp() {
  const supabase = getSupabaseAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setReady(true);
    });
    // A directly-generated magic link returns the session in the URL hash
    // (implicit flow); the email flow returns a ?code (PKCE) handled by
    // detectSessionInUrl. Establish the session either way.
    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    const p = new URLSearchParams(hash);
    const at = p.get("access_token");
    const rt = p.get("refresh_token");
    if (at && rt) {
      supabase.auth.setSession({ access_token: at, refresh_token: rt }).then(() => {
        window.history.replaceState(null, "", window.location.pathname);
        setReady(true);
      });
    } else {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setReady(true);
      });
    }
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return <Centered>Configuration Supabase manquante.</Centered>;
  }
  if (!ready) return <Centered>Chargement…</Centered>;

  const email = session?.user?.email?.toLowerCase();
  const isAdmin = email === ADMIN_EMAIL;

  if (!session) return <Login supabase={supabase} />;
  if (!isAdmin) {
    return (
      <Centered>
        <p>Accès réservé.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-3 text-orange hover:underline text-sm">
          Se déconnecter
        </button>
      </Centered>
    );
  }
  return <Dashboard token={session.access_token} onSignOut={() => supabase.auth.signOut()} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] bg-black text-white flex items-center justify-center p-6 text-center">
      <div>{children}</div>
    </main>
  );
}

function Login({ supabase }: { supabase: NonNullable<ReturnType<typeof getSupabaseAuth>> }) {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/pimpmycourt/admin` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <Centered>
      <div className="max-w-xs mx-auto">
        <h1 className="font-heading text-2xl font-bold italic uppercase mb-4">Back-office</h1>
        {sent ? (
          <p className="text-white/70 text-sm">
            Lien envoyé à <span className="text-orange">{email}</span>. Ouvre-le sur cet appareil.
          </p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange"
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <button
              onClick={send}
              className="mt-3 w-full rounded-full bg-orange text-black py-2.5 font-heading font-bold uppercase text-sm hover:bg-orange-light"
            >
              Recevoir le lien
            </button>
          </>
        )}
      </div>
    </Centered>
  );
}

type Section = "overview" | "moderation" | "terrains" | "data";

const SECTION_LABEL: Record<Section, string> = {
  overview: "Vue d'ensemble",
  moderation: "Modération",
  terrains: "Terrains",
  data: "Données",
};

function Dashboard({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [section, setSection] = useState<Section>("overview");
  const authHeaders = useCallback(
    (extra?: Record<string, string>) => ({ Authorization: `Bearer ${token}`, ...extra }),
    [token],
  );

  // Shared terrain dataset — used by the overview stats, the map and the list.
  const [terrains, setTerrains] = useState<AdminTerrain[]>([]);
  const [tLoading, setTLoading] = useState(true);
  const [tError, setTError] = useState<string | null>(null);
  const loadTerrains = useCallback(() => {
    fetch("/api/pimpmycourt/admin/terrains", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setTError(d.error ?? null); setTerrains(d.terrains ?? []); setTLoading(false); })
      .catch(() => { setTError("réseau"); setTLoading(false); });
  }, [authHeaders]);
  useEffect(() => { loadTerrains(); }, [loadTerrains]);

  const pendingCount = terrains.filter((t) => t.statut === "signale").length;

  return (
    <main className="min-h-[100dvh] bg-black text-white md:flex">
      {/* Left column */}
      <aside className="md:w-56 md:shrink-0 md:sticky md:top-0 md:h-[100dvh] border-b md:border-b-0 md:border-r border-white/10 bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 md:py-4">
          <span className="font-heading font-bold italic uppercase text-sm">PMC · Admin</span>
          <button onClick={onSignOut} className="md:hidden text-xs text-white/40 hover:text-white">Déconnexion</button>
        </div>
        <nav className="flex md:flex-col gap-1 px-2 pb-2 overflow-x-auto md:overflow-visible">
          {(Object.keys(SECTION_LABEL) as Section[]).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`relative flex items-center gap-1.5 text-left rounded-lg px-3 py-2 text-sm font-heading font-bold whitespace-nowrap transition-colors ${section === s ? "bg-orange text-black" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              {SECTION_LABEL[s]}
              {s === "moderation" && pendingCount > 0 && (
                <span className="inline-block h-2 w-2 rounded-full bg-[#ef4444]" aria-label={`${pendingCount} à modérer`} />
              )}
            </button>
          ))}
        </nav>
        <button onClick={onSignOut} className="mt-auto hidden md:block px-4 py-3 text-left text-xs text-white/40 hover:text-white border-t border-white/10">
          Déconnexion
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          <h1 className="font-heading text-2xl font-bold mb-4">{SECTION_LABEL[section]}</h1>
          {section === "overview" && <Overview terrains={terrains} loading={tLoading} error={tError} authHeaders={authHeaders} onGo={setSection} />}
          {section === "moderation" && <Moderation authHeaders={authHeaders} onModerated={loadTerrains} />}
          {section === "terrains" && <Terrains terrains={terrains} loading={tLoading} error={tError} reload={loadTerrains} authHeaders={authHeaders} />}
          {section === "data" && <DataTools authHeaders={authHeaders} />}
        </div>
      </div>
    </main>
  );
}

function Overview({
  terrains,
  loading,
  error,
  authHeaders,
  onGo,
}: {
  terrains: AdminTerrain[];
  loading: boolean;
  error: string | null;
  authHeaders: Auth;
  onGo: (s: Section) => void;
}) {
  const [visits, setVisits] = useState<{ pageviews: number; visitors: number } | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/pimpmycourt/admin/visits", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { if (active) setVisits({ pageviews: d.pageviews ?? 0, visitors: d.visitors ?? 0 }); })
      .catch(() => { if (active) setVisits({ pageviews: 0, visitors: 0 }); });
    return () => { active = false; };
  }, [authHeaders]);

  if (loading) return <p className="text-white/40 text-center py-10">Chargement…</p>;
  if (error) return <p className="text-red-400 text-center py-10">Erreur : {error}</p>;

  const by = (s: string) => terrains.filter((t) => t.statut === s).length;
  const filetsRemplaces = terrains.reduce((sum, t) => sum + (t.etat === "remplace" ? (t.nb_filets_a_remplacer ?? 0) : 0), 0);

  const recent = [...terrains].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Visites" value={visits?.pageviews ?? 0} accent="#ff7200" />
        <StatCard label="Filets remplacés" value={filetsRemplaces} accent="#2fc600" />
        <StatCard label="Terrains signalés" value={terrains.length} accent="#FFFFFF" onClick={() => onGo("terrains")} />
        <StatCard label="Terrains à modérer" value={by("signale")} accent="#FFFFFF" onClick={() => onGo("moderation")} />
      </div>

      {/* Recent */}
      <div>
        <p className="font-heading font-bold uppercase text-xs text-white/50 mb-2">Derniers signalements</p>
        {recent.length === 0 ? (
          <p className="text-white/30 text-sm">—</p>
        ) : (
          <ul className="space-y-1.5">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: STATUT_META[t.statut]?.color ?? "#8A8A8A" }} />
                <span className="text-white/80 truncate flex-1">{t.nom_terrain ?? t.ville ?? "Terrain"}</span>
                <span className="text-white/30 text-xs shrink-0">{t.ville ?? ""}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map on the home dashboard */}
      <div>
        <p className="font-heading font-bold uppercase text-xs text-white/50 mb-2">Carte</p>
        <AdminMap terrains={terrains} />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, onClick }: { label: string; value: number; accent: string; onClick?: () => void }) {
  const inner = (
    <>
      <div className="font-heading text-2xl font-bold" style={{ color: accent }}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-white/40 font-heading font-bold mt-0.5">{label}</div>
    </>
  );
  const base = "rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left w-full";
  return onClick ? (
    <button onClick={onClick} className={`${base} hover:bg-white/[0.06] transition-colors`}>{inner}</button>
  ) : (
    <div className={base}>{inner}</div>
  );
}


type Auth = (extra?: Record<string, string>) => Record<string, string>;

function Moderation({ authHeaders, onModerated }: { authHeaders: Auth; onModerated?: () => void }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/pimpmycourt/admin/queue", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setError(d.error ?? null);
        setQueue(d.queue ?? []);
        setI(0);
        setLoading(false);
      });
    return () => { active = false; };
  }, [authHeaders]);

  const load = () => {
    setLoading(true);
    fetch("/api/pimpmycourt/admin/queue", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setError(d.error ?? null); setQueue(d.queue ?? []); setI(0); setLoading(false); });
  };

  const current = queue[i];

  async function act(action: "valider" | "doublon" | "rejeter") {
    if (!current) return;
    await fetch("/api/pimpmycourt/admin/moderate", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: current.id, action }),
    });
    setI((n) => n + 1);
    onModerated?.();
  }

  async function merge() {
    if (!current?.merge_candidate) return;
    await fetch("/api/pimpmycourt/admin/merge", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ keepId: current.merge_candidate.id, dropId: current.id }),
    });
    setI((n) => n + 1);
    onModerated?.();
  }

  if (loading) return <p className="text-white/40 text-center py-10">Chargement…</p>;
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-400 font-heading font-bold">Erreur de chargement</p>
        <p className="text-white/50 text-sm mt-1">{error}</p>
        <button onClick={load} className="mt-3 text-orange text-sm hover:underline">Réessayer</button>
      </div>
    );
  }
  if (!current) {
    return (
      <div className="text-center py-10">
        <p className="text-white/60">File vide 🎉</p>
        <button onClick={load} className="mt-3 text-orange text-sm hover:underline">Recharger</button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-white/40 mb-2">{queue.length - i} en attente</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={satelliteImageUrl(current.latitude, current.longitude, 640, 480)} alt="Vue satellite" className="w-full aspect-[4/3] object-cover rounded-xl bg-white/5" />
      <div className="mt-3">
        <div className="font-heading text-xl font-bold">
          {current.nom_terrain ?? current.ville ?? "Terrain"} <span className="text-white/40 text-sm">{current.ville} {current.departement}</span>
        </div>
        <div className="text-sm text-white/50">
          {current.nb_filets_a_remplacer != null ? `${current.nb_filets_a_remplacer} filet(s) à remplacer · ` : ""}
          {current.nb_paniers != null ? `${current.nb_paniers} panier(s) · ` : ""}
          {current.nb_confirmations} confirmation{current.nb_confirmations > 1 ? "s" : ""}
        </div>
        <div className="text-xs text-white/30 mt-1 space-y-0.5">
          {(current.prenom || current.nom || current.age != null) && (
            <p>{[current.prenom, current.nom].filter(Boolean).join(" ")}{current.age != null ? ` · ${current.age} ans` : ""}</p>
          )}
          {current.contact_email && <p>✉ {current.contact_email}</p>}
          {current.contact_instagram && <p>IG {current.contact_instagram}</p>}
          {current.contact_tiktok && <p>TikTok {current.contact_tiktok}</p>}
        </div>
      </div>

      {current.merge_candidate && (
        <div className="mt-3 rounded-lg border border-orange/40 bg-orange/10 p-3 text-sm">
          Terrain existant à {current.merge_candidate.distance} m ({current.merge_candidate.statut}).
          <button onClick={merge} className="ml-2 underline text-orange font-bold">Fusionner</button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button onClick={() => act("valider")} className="rounded-full bg-orange text-black py-3 font-heading font-bold uppercase text-sm">Valider (à remplacer)</button>
        <button onClick={() => act("doublon")} className="rounded-full bg-white/10 text-white py-3 font-heading font-bold uppercase text-sm">Doublon</button>
        <button onClick={() => act("rejeter")} className="rounded-full bg-[#E4572E] text-white py-3 font-heading font-bold uppercase text-sm">Rejeter</button>
      </div>
    </div>
  );
}

type AdminTerrain = {
  id: string;
  latitude: number;
  longitude: number;
  ville: string | null;
  departement: string | null;
  statut: string;
  etat: "a_remplacer" | "remplace";
  date_remplacement: string | null;
  nb_confirmations: number;
  nb_paniers: number | null;
  nb_filets_a_remplacer: number | null;
  nom_terrain: string | null;
  created_at: string;
  prenom: string | null;
  nom: string | null;
  age: number | null;
  contact_email: string | null;
  contact_instagram: string | null;
  contact_tiktok: string | null;
  commentaire: string | null;
};

const STATUT_META: Record<string, { label: string; color: string }> = {
  verifie: { label: "Validé", color: "#2fc600" },
  signale: { label: "Signalé", color: "#ff7200" },
  doublon: { label: "Doublon", color: "#8A8A8A" },
  rejete: { label: "Rejeté", color: "#E4572E" },
};

type TFilter = "a_remplacer" | "remplace" | "all";

function Terrains({ terrains, loading, error, reload, authHeaders }: {
  terrains: AdminTerrain[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  authHeaders: Auth;
}) {
  const [filter, setFilter] = useState<TFilter>("all");
  const [region, setRegion] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [merging, setMerging] = useState(false);
  const [editing, setEditing] = useState<AdminTerrain | null>(null);

  const regionOf = (t: AdminTerrain) => t.departement?.trim() || t.ville?.trim() || "";
  const regions = [...new Set(terrains.map(regionOf).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const list = terrains.filter(
    (t) => (filter === "all" || t.etat === filter) && (region === "all" || regionOf(t) === region),
  );
  const selectedTerrains = terrains.filter((t) => selected.has(t.id));
  // Keep the most-confirmed terrain; fold the others into it.
  const keep = selectedTerrains.reduce<AdminTerrain | null>(
    (best, t) => (!best || t.nb_confirmations > best.nb_confirmations ? t : best),
    null,
  );

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function mergeSelection() {
    if (!keep || selected.size < 2) return;
    const dropIds = [...selected].filter((id) => id !== keep.id);
    const keepName = keep.nom_terrain ?? keep.ville ?? "ce terrain";
    if (!window.confirm(`Fusionner ${selected.size} terrains dans « ${keepName} » ? Les ${dropIds.length} autres seront supprimés.`)) return;
    setMerging(true);
    const res = await fetch("/api/pimpmycourt/admin/merge", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ keepId: keep.id, dropIds }),
    });
    setMerging(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "erreur lors de la fusion");
      return;
    }
    setSelected(new Set());
    reload();
  }

  async function markReplaced(id: string, date: string | null) {
    const res = await fetch("/api/pimpmycourt/admin/remplace", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id, date }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "erreur");
      return;
    }
    reload();
  }

  if (loading) return <p className="text-white/40 text-center py-10">Chargement…</p>;
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-400 font-heading font-bold">Erreur de chargement</p>
        <p className="text-white/50 text-sm mt-1">{error}</p>
        <button onClick={reload} className="mt-3 text-orange text-sm hover:underline">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Filter by état */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs font-heading font-bold">
        {([["a_remplacer", "À remplacer"], ["remplace", "Remplacés"], ["all", "Tous les terrains"]] as [TFilter, string][]).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 border ${filter === f ? "bg-orange text-black border-orange" : "border-white/15 text-white/60 hover:text-white"}`}
          >
            {label} {f === "all" ? terrains.length : terrains.filter((t) => t.etat === f).length}
          </button>
        ))}
      </div>

      {/* Filter by région */}
      {regions.length > 0 && (
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="mb-3 w-full sm:w-auto rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange"
        >
          <option value="all">Toutes les régions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r} ({terrains.filter((t) => regionOf(t) === r).length})</option>
          ))}
        </select>
      )}

      <p className="text-[11px] text-white/30 mb-2">Touche un terrain pour le sélectionner, puis fusionne les doublons.</p>

      {list.length === 0 ? (
        <p className="text-white/40 text-center py-10">Aucun terrain.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((t) => {
            const sel = selected.has(t.id);
            const meta = STATUT_META[t.statut] ?? { label: t.statut, color: "#8A8A8A" };
            return (
              <li key={t.id} className={`rounded-xl border p-2 transition-colors ${sel ? "border-orange bg-orange/10" : "border-white/10"}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(t.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                    <span className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={satelliteImageUrl(t.latitude, t.longitude, 128, 128)} alt="" className="h-14 w-14 rounded-lg object-cover bg-white/5" />
                      <span className="absolute -top-1 -left-1 h-3 w-3 rounded-full ring-2 ring-black" style={{ background: ETAT_COLOR[t.etat] }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading font-bold text-sm truncate">
                        {t.nom_terrain ?? t.ville ?? "Terrain"}
                      </span>
                      <span className="block text-xs text-white/40 truncate">{[t.ville, t.departement].filter(Boolean).join(" · ")}</span>
                      <span className="mt-1 flex items-center gap-2 text-[11px]">
                        <span className="rounded px-1.5 py-0.5 font-bold" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.label}</span>
                        <span className="text-white/40">{t.nb_confirmations} conf.</span>
                        {t.nb_filets_a_remplacer != null && <span className="text-white/40">{t.nb_filets_a_remplacer} filet(s)</span>}
                      </span>
                      {t.commentaire && (
                        <span className="mt-1 block text-xs text-white/60 italic">“{t.commentaire}”</span>
                      )}
                    </span>
                  </button>
                  <button onClick={() => setEditing(t)} aria-label="Éditer" className="shrink-0 text-white/30 hover:text-orange px-1">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                  </button>
                  <a href={`/pimpmycourt/terrain/${t.id}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-white/30 hover:text-orange text-sm px-1" aria-label="Ouvrir la fiche">↗</a>
                  <button onClick={() => toggle(t.id)} aria-label="Sélectionner" className={`shrink-0 h-5 w-5 rounded-md border flex items-center justify-center text-[11px] ${sel ? "bg-orange border-orange text-black" : "border-white/25 text-transparent"}`}>✓</button>
                </div>

                {/* Replacement (only for validated terrains — visible publicly) */}
                {t.statut === "verifie" && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-xs">
                    {t.etat === "remplace" ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold" style={{ color: ETAT_COLOR.remplace }}>
                          ✓ Remplacé{t.date_remplacement ? ` le ${formatDate(t.date_remplacement)}` : ""}
                        </span>
                        <button onClick={() => markReplaced(t.id, null)} className="text-white/40 hover:text-white underline">annuler</button>
                      </div>
                    ) : (
                      <ReplaceControl onMark={(date) => markReplaced(t.id, date)} />
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Merge action bar */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/95 backdrop-blur px-4 py-3">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <div className="min-w-0 flex-1 text-xs">
              <span className="font-bold text-white">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
              {selected.size >= 2 && keep && (
                <span className="block text-white/40 truncate">On garde : {keep.nom_terrain ?? keep.ville ?? "le plus confirmé"}</span>
              )}
            </div>
            <button onClick={() => setSelected(new Set())} className="text-xs text-white/50 hover:text-white shrink-0">Annuler</button>
            <button
              onClick={mergeSelection}
              disabled={selected.size < 2 || merging}
              className="rounded-full bg-orange text-black px-4 py-2 font-heading font-bold uppercase text-xs disabled:opacity-40 shrink-0"
            >
              {merging ? "…" : `Fusionner ${selected.size}`}
            </button>
          </div>
        </div>
      )}

      {editing && (
        <EditTerrain terrain={editing} authHeaders={authHeaders} onClose={() => setEditing(null)} onSaved={reload} />
      )}
    </div>
  );
}

function EditTerrain({ terrain, authHeaders, onClose, onSaved }: {
  terrain: AdminTerrain;
  authHeaders: Auth;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nom, setNom] = useState(terrain.nom_terrain ?? "");
  const [ville, setVille] = useState(terrain.ville ?? "");
  const [nbPaniers, setNbPaniers] = useState(terrain.nb_paniers != null ? String(terrain.nb_paniers) : "");
  const [nbFilets, setNbFilets] = useState(terrain.nb_filets_a_remplacer != null ? String(terrain.nb_filets_a_remplacer) : "");
  const [statut, setStatut] = useState(terrain.statut);
  const [remplaceDate, setRemplaceDate] = useState(terrain.date_remplacement ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const INPUT = "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-orange";

  async function save() {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/pimpmycourt/admin/update", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        id: terrain.id,
        nom_terrain: nom.trim() || null,
        ville: ville.trim() || null,
        nb_paniers: nbPaniers === "" ? null : Number(nbPaniers),
        nb_filets_a_remplacer: nbFilets === "" ? null : Number(nbFilets),
        statut,
      }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setMsg(d.error ?? "erreur"); return; }
    onSaved(); onClose();
  }

  async function remove() {
    if (!window.confirm("Supprimer définitivement ce terrain ?")) return;
    setBusy(true); setMsg(null);
    const res = await fetch("/api/pimpmycourt/admin/delete", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: terrain.id }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setMsg(d.error ?? "erreur"); return; }
    onSaved(); onClose();
  }

  async function uploadPhoto(which: "avant" | "apres", file: File) {
    setBusy(true); setMsg(null);
    const fd = new FormData();
    fd.set("id", terrain.id);
    fd.set("which", which);
    fd.set("photo", file);
    const res = await fetch("/api/pimpmycourt/admin/photo", { method: "POST", headers: authHeaders(), body: fd });
    setBusy(false);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(d.error ?? "erreur photo"); return; }
    setMsg("Photo mise à jour ✓");
    onSaved();
  }

  async function setRemplace(date: string | null) {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/pimpmycourt/admin/remplace", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: terrain.id, date }),
    });
    setBusy(false);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(d.error ?? "erreur"); return; }
    if (!date) setRemplaceDate("");
    setMsg(date ? "Marqué remplacé ✓" : "Remplacement retiré ✓");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[#0d0d0d] border border-white/10 p-5 max-h-[85dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-bold">Éditer le terrain</h3>
          <button onClick={onClose} aria-label="Fermer" className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 text-2xl leading-none">×</button>
        </div>

        <div className="space-y-3">
          {/* Reporter's form info (read-only) */}
          {(terrain.prenom || terrain.nom || terrain.contact_email || terrain.contact_instagram || terrain.contact_tiktok || terrain.commentaire) && (
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs space-y-1">
              <p className="font-heading font-bold uppercase text-white/50 text-[11px]">Signalé par</p>
              {(terrain.prenom || terrain.nom || terrain.age != null) && (
                <p className="text-white/80">{[terrain.prenom, terrain.nom].filter(Boolean).join(" ") || "—"}{terrain.age != null ? ` · ${terrain.age} ans` : ""}</p>
              )}
              {terrain.contact_email && <p className="text-white/60">✉ <a href={`mailto:${terrain.contact_email}`} className="hover:text-orange">{terrain.contact_email}</a></p>}
              {terrain.contact_instagram && <p className="text-white/60">Instagram : {terrain.contact_instagram}</p>}
              {terrain.contact_tiktok && <p className="text-white/60">TikTok : {terrain.contact_tiktok}</p>}
              {terrain.commentaire && <p className="text-white/70 italic">“{terrain.commentaire}”</p>}
            </div>
          )}

          <label className="block text-xs text-white/50">Nom du terrain
            <input value={nom} onChange={(e) => setNom(e.target.value)} className={`${INPUT} mt-1`} />
          </label>
          <label className="block text-xs text-white/50">Ville
            <input value={ville} onChange={(e) => setVille(e.target.value)} className={`${INPUT} mt-1`} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-white/50">Paniers
              <input type="number" min="0" value={nbPaniers} onChange={(e) => setNbPaniers(e.target.value)} className={`${INPUT} mt-1`} />
            </label>
            <label className="block text-xs text-white/50">Filets à remplacer
              <input type="number" min="0" value={nbFilets} onChange={(e) => setNbFilets(e.target.value)} className={`${INPUT} mt-1`} />
            </label>
          </div>
          <label className="block text-xs text-white/50">Statut
            <select value={statut} onChange={(e) => setStatut(e.target.value)} className={`${INPUT} mt-1`}>
              <option value="signale">Signalé</option>
              <option value="verifie">Validé</option>
              <option value="doublon">Doublon</option>
              <option value="rejete">Rejeté</option>
            </select>
          </label>

          {/* Replacement — mark/undo a replaced net */}
          <div className="pt-1">
            <p className="text-xs text-white/50 mb-1">Remplacement du filet</p>
            {terrain.date_remplacement && (
              <p className="text-xs mb-1.5 font-bold" style={{ color: ETAT_COLOR.remplace }}>✓ Remplacé le {formatDate(terrain.date_remplacement)}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <input type="date" value={remplaceDate} onChange={(e) => setRemplaceDate(e.target.value)} className={`${INPUT} !w-auto [color-scheme:dark]`} />
              <button onClick={() => setRemplace(remplaceDate || new Date().toISOString().slice(0, 10))} disabled={busy} className="rounded-full text-white px-3 py-2 text-xs font-heading font-bold uppercase disabled:opacity-40" style={{ background: ETAT_COLOR.remplace }}>Marquer remplacé</button>
              {terrain.date_remplacement && (
                <button onClick={() => setRemplace(null)} disabled={busy} className="rounded-full bg-white/10 text-white px-3 py-2 text-xs font-heading font-bold uppercase hover:bg-white/20 disabled:opacity-40">Retirer</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="block text-xs text-white/50">Photo avant
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto("avant", e.target.files[0])} className="mt-1 block w-full text-xs text-white/70 file:mr-2 file:rounded-full file:border-0 file:bg-orange file:px-3 file:py-1.5 file:text-black file:font-bold" />
            </label>
            <label className="block text-xs text-white/50">Photo après
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto("apres", e.target.files[0])} className="mt-1 block w-full text-xs text-white/70 file:mr-2 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white file:font-bold" />
            </label>
          </div>

          {msg && <p className="text-xs text-white/70">{msg}</p>}

          <div className="flex items-center gap-2 pt-2">
            <button onClick={remove} disabled={busy} className="rounded-full bg-[#E4572E] text-white px-4 py-2.5 text-sm font-heading font-bold uppercase disabled:opacity-40">Supprimer</button>
            <button onClick={save} disabled={busy} className="flex-1 rounded-full bg-orange text-black px-4 py-2.5 text-sm font-heading font-bold uppercase hover:bg-orange-light disabled:opacity-40">
              {busy ? "…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplaceControl({ onMark }: { onMark: (date: string) => void }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded bg-white/5 border border-white/10 px-2 py-1 text-white text-xs [color-scheme:dark]"
      />
      <button onClick={() => onMark(date)} className="rounded-full text-white px-3 py-1 font-bold" style={{ background: "#2fc600" }}>
        Marquer remplacé
      </button>
    </div>
  );
}

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("fr-FR");
  } catch {
    return d;
  }
}

function DataTools({ authHeaders }: { authHeaders: Auth }) {
  const [msg, setMsg] = useState<string | null>(null);

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg("Import en cours…");
    const csv = await file.text();
    const res = await fetch("/api/pimpmycourt/admin/import", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "text/csv" }),
      body: csv,
    });
    const data = await res.json();
    setMsg(res.ok ? `Importé : ${data.inserted} (ignorés : ${data.skipped})` : `Erreur : ${data.error}`);
  }

  async function onExport() {
    const res = await fetch("/api/pimpmycourt/admin/export", { headers: authHeaders() });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pimpmycourt-terrains.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading font-bold uppercase text-sm mb-1">Import CSV</p>
        <p className="text-xs text-white/40 mb-2">Colonnes : latitude, longitude, ville, statut, photo, categorie</p>
        <input type="file" accept=".csv,text/csv" onChange={onImport} className="text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-orange file:px-4 file:py-2 file:text-black file:font-bold" />
      </div>
      <div>
        <p className="font-heading font-bold uppercase text-sm mb-1">Export CSV</p>
        <button onClick={onExport} className="rounded-full glass-subtle px-5 py-2 text-sm font-heading font-bold hover:bg-white/10">
          Exporter les terrains validés
        </button>
      </div>
      {msg && <p className="text-sm text-white/70">{msg}</p>}
    </div>
  );
}
