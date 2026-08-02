"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseAuth } from "@/lib/pmc/supabaseAuthClient";
import { ADMIN_EMAIL } from "@/lib/pmc/admin";

type QueueItem = {
  id: string;
  ville: string | null;
  departement: string | null;
  photo_avant_url: string | null;
  nb_confirmations: number;
  nb_paniers: number | null;
  contact_email: string | null;
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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
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

type Tab = "moderation" | "kits" | "data";

function Dashboard({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("moderation");
  const authHeaders = useCallback(
    (extra?: Record<string, string>) => ({ Authorization: `Bearer ${token}`, ...extra }),
    [token],
  );

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-black/90 backdrop-blur border-b border-white/10 px-4 py-3">
        <span className="font-heading font-bold italic uppercase">PMC · Admin</span>
        <button onClick={onSignOut} className="text-xs text-white/40 hover:text-white">Déconnexion</button>
      </header>

      <nav className="flex border-b border-white/10 text-sm font-heading font-bold">
        {(["moderation", "kits", "data"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 uppercase ${tab === t ? "text-orange border-b-2 border-orange" : "text-white/40"}`}
          >
            {t === "moderation" ? "Modération" : t === "kits" ? "Kits" : "Données"}
          </button>
        ))}
      </nav>

      <div className="max-w-md mx-auto p-4">
        {tab === "moderation" && <Moderation authHeaders={authHeaders} />}
        {tab === "kits" && <Kits authHeaders={authHeaders} />}
        {tab === "data" && <DataTools authHeaders={authHeaders} />}
      </div>
    </main>
  );
}

type Auth = (extra?: Record<string, string>) => Record<string, string>;

function Moderation({ authHeaders }: { authHeaders: Auth }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [i, setI] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/pimpmycourt/admin/queue", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
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
      .then((d) => { setQueue(d.queue ?? []); setI(0); setLoading(false); });
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
  }

  async function merge() {
    if (!current?.merge_candidate) return;
    await fetch("/api/pimpmycourt/admin/merge", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ keepId: current.merge_candidate.id, dropId: current.id }),
    });
    setI((n) => n + 1);
  }

  if (loading) return <p className="text-white/40 text-center py-10">Chargement…</p>;
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
      {current.photo_avant_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current.photo_avant_url} alt="" className="w-full aspect-[4/3] object-cover rounded-xl bg-white/5" />
      ) : (
        <div className="w-full aspect-[4/3] rounded-xl bg-white/5 flex items-center justify-center text-white/30 text-sm">Sans photo</div>
      )}
      <div className="mt-3">
        <div className="font-heading text-xl font-bold">
          {current.ville ?? "Ville inconnue"} <span className="text-white/40 text-sm">{current.departement}</span>
        </div>
        <div className="text-sm text-white/50">
          {current.nb_paniers != null ? `${current.nb_paniers} panier${current.nb_paniers > 1 ? "s" : ""} · ` : ""}
          {current.nb_confirmations} confirmation{current.nb_confirmations > 1 ? "s" : ""}
          {current.prenom ? ` · ${current.prenom}` : ""}
        </div>
        {current.commentaire && <p className="text-sm text-white/60 mt-1 italic">“{current.commentaire}”</p>}
        {current.contact_email && <p className="text-xs text-white/30 mt-1">{current.contact_email}</p>}
      </div>

      {current.merge_candidate && (
        <div className="mt-3 rounded-lg border border-orange/40 bg-orange/10 p-3 text-sm">
          Terrain existant à {current.merge_candidate.distance} m ({current.merge_candidate.statut}).
          <button onClick={merge} className="ml-2 underline text-orange font-bold">Fusionner</button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button onClick={() => act("valider")} className="rounded-full bg-[#2FA84F] text-white py-3 font-heading font-bold uppercase text-sm">Valider</button>
        <button onClick={() => act("doublon")} className="rounded-full bg-white/10 text-white py-3 font-heading font-bold uppercase text-sm">Doublon</button>
        <button onClick={() => act("rejeter")} className="rounded-full bg-[#E4572E] text-white py-3 font-heading font-bold uppercase text-sm">Rejeter</button>
      </div>
    </div>
  );
}

type Kit = {
  id: string; prenom: string | null; nom: string | null; email: string | null;
  age: number | null; trepied: string | null; modele_telephone: string | null;
  autorisation_validee: boolean; statut_demande: string; cout_kit: number | null;
};

function Kits({ authHeaders }: { authHeaders: Auth }) {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/pimpmycourt/admin/kits", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { if (active) { setKits(d.kits ?? []); setLoading(false); } });
    return () => { active = false; };
  }, [authHeaders, tick]);

  async function act(id: string, action: string) {
    const res = await fetch("/api/pimpmycourt/admin/kit-action", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id, action }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? "erreur");
      return;
    }
    setTick((n) => n + 1);
  }

  if (loading) return <p className="text-white/40 text-center py-10">Chargement…</p>;
  if (!kits.length) return <p className="text-white/40 text-center py-10">Aucune demande de kit pour l&apos;instant.</p>;

  return (
    <ul className="space-y-3">
      {kits.map((k) => {
        const minor = typeof k.age === "number" && k.age > 0 && k.age < 18;
        return (
          <li key={k.id} className="rounded-lg border border-white/10 p-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-bold">{k.prenom ?? ""} {k.nom ?? ""}</div>
              <span className="text-xs text-orange">{k.statut_demande}</span>
            </div>
            <div className="text-white/50 text-xs">{k.email}</div>
            <div className="text-white/40 text-xs mt-1">
              {k.age != null ? `${k.age} ans` : "âge ?"} · trépied: {k.trepied ?? "?"} · {k.modele_telephone ?? "tél ?"}
              {k.cout_kit != null ? ` · ${k.cout_kit} €` : ""}
            </div>
            {minor && (
              <div className={`text-xs mt-1 font-bold ${k.autorisation_validee ? "text-[#2FA84F]" : "text-[#E4572E]"}`}>
                Mineur — autorisation {k.autorisation_validee ? "validée" : "à valider (envoi bloqué)"}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {minor && !k.autorisation_validee && (
                <ActionBtn onClick={() => act(k.id, "validate_parental")}>Valider autorisation</ActionBtn>
              )}
              <ActionBtn onClick={() => act(k.id, "approve")}>Approuver</ActionBtn>
              <ActionBtn onClick={() => act(k.id, "ship")}>Expédié</ActionBtn>
              <ActionBtn onClick={() => act(k.id, "delivered")}>Livré</ActionBtn>
              <ActionBtn onClick={() => act(k.id, "rushes")}>Rushes reçus</ActionBtn>
              <ActionBtn onClick={() => act(k.id, "reject")}>Rejeter</ActionBtn>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ActionBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10 transition-colors">
      {children}
    </button>
  );
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
