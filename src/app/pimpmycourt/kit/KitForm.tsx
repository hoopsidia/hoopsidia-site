"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// Kit request form (§6). "Demande de kit" vocabulary — never "commande". Nothing
// blocks entry beyond the explicit obligations (rights + three commitments, and
// a parental authorization for minors). Arbitration happens in the back-office.

const inputCls =
  "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange";

export default function KitForm({ terrainId }: { terrainId: string | null }) {
  const [age, setAge] = useState("");
  const [trepied, setTrepied] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMinor = useMemo(() => {
    const n = Number(age);
    return Number.isFinite(n) && n > 0 && n < 18;
  }, [age]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("trepied", trepied);
    try {
      const res = await fetch("/api/pimpmycourt/kit", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "erreur");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "erreur");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-[100dvh] bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="font-heading text-2xl font-bold italic uppercase">Demande reçue</h1>
          <p className="mt-3 text-white/60 text-sm">
            Ta demande entre en file d&apos;attente. Les envois sont limités et sélectionnés selon
            les priorités du projet. On te recontacte par email si ton kit part.
          </p>
          <Link href="/pimpmycourt/tournage" className="mt-6 inline-block rounded-full bg-orange text-black px-6 py-3 font-heading font-bold uppercase text-sm hover:bg-orange-light">
            Relire le protocole
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <form onSubmit={onSubmit} className="max-w-lg mx-auto px-4 sm:px-6 pt-20 pb-10 space-y-6">
        <div>
          <Link href="/pimpmycourt" className="text-sm text-white/50 hover:text-orange">← La carte des filets</Link>
          <h1 className="mt-4 font-heading text-3xl font-bold italic uppercase">Demander un kit</h1>
          <p className="mt-2 text-sm text-white/50">
            Envois limités, sélectionnés selon les priorités du projet et l&apos;ordre des demandes.
            Aucun engagement de livraison. En échange du matériel, tu filmes la pose.
          </p>
        </div>

        {terrainId && <input type="hidden" name="terrain_id" value={terrainId} />}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        {/* Identité & logistique */}
        <fieldset className="space-y-3">
          <legend className="font-heading font-bold uppercase text-sm text-orange mb-1">Identité & logistique</legend>
          <div className="grid grid-cols-2 gap-3">
            <input name="prenom" placeholder="Prénom" className={inputCls} />
            <input name="nom" placeholder="Nom" className={inputCls} />
          </div>
          <input name="email" type="email" required placeholder="Email *" className={inputCls} />
          <input name="telephone" placeholder="Téléphone" className={inputCls} />
          <input name="adresse" placeholder="Adresse postale" className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input name="code_postal" placeholder="Code postal" className={inputCls} />
            <input name="ville" placeholder="Ville" className={inputCls} />
          </div>
          <input name="age" type="number" min="1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Âge" className={inputCls} />
        </fieldset>

        {/* Matériel de tournage */}
        <fieldset className="space-y-3">
          <legend className="font-heading font-bold uppercase text-sm text-orange mb-1">Matériel de tournage</legend>
          <div>
            <p className="text-sm text-white/70 mb-1">Trépied téléphone (non fourni dans le kit)</p>
            <div className="flex flex-wrap gap-2">
              {[["oui", "J'en ai un"], ["emprunt", "Je peux en emprunter"], ["non", "Non"]].map(([v, label]) => (
                <button type="button" key={v} onClick={() => setTrepied(v)} className={`rounded-full px-3 py-1.5 text-sm border ${trepied === v ? "bg-orange text-black border-orange" : "border-white/20 text-white/70"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <input name="modele_telephone" placeholder="Modèle de téléphone (ex. iPhone 13)" className={inputCls} />
          <select name="methode_rushes" className={inputCls} defaultValue="">
            <option value="" disabled>Envoi des rushes…</option>
            <option value="drive">Google Drive</option>
            <option value="wetransfer">WeTransfer</option>
            <option value="autre">Autre</option>
          </select>
        </fieldset>

        {/* Minor block */}
        {isMinor && (
          <fieldset className="space-y-3 rounded-xl border border-orange/40 bg-orange/5 p-4">
            <legend className="font-heading font-bold uppercase text-sm text-orange px-2">Mineur — représentant légal</legend>
            <input name="representant_nom" placeholder="Nom du représentant légal" className={inputCls} />
            <input name="representant_email" type="email" placeholder="Email du représentant" className={inputCls} />
            <input name="representant_telephone" placeholder="Téléphone du représentant" className={inputCls} />
            <div>
              <p className="text-sm text-white/70 mb-1">Autorisation parentale signée (participation + droit à l&apos;image) *</p>
              <input name="autorisation" type="file" accept="application/pdf,image/*" className="text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-orange file:px-4 file:py-2 file:text-black file:font-bold" />
              <p className="text-xs text-white/40 mt-1">Modèle PDF à fournir. Aucun envoi possible sans autorisation validée.</p>
            </div>
          </fieldset>
        )}

        {/* Engagements */}
        <fieldset className="space-y-2">
          <legend className="font-heading font-bold uppercase text-sm text-orange mb-1">Engagements</legend>
          {[
            ["engage_protocole", "Je m'engage à suivre le protocole de tournage"],
            ["engage_film", "Je m'engage à filmer avant, pendant et après la pose"],
            ["engage_rushes", "Je m'engage à envoyer les rushes sous 15 jours"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-start gap-2 text-sm text-white/70">
              <input type="checkbox" name={name} value="1" required className="mt-0.5" />
              <span>
                {label} (<Link href="/pimpmycourt/tournage" target="_blank" className="text-orange hover:underline">protocole</Link>)
              </span>
            </label>
          ))}
        </fieldset>

        {/* Rights */}
        <label className="flex items-start gap-2 text-sm text-white/70">
          <input type="checkbox" name="cession_droits" value="1" required className="mt-0.5" />
          <span>
            Je cède à HOOPSIDIA SAS les droits d&apos;exploitation des images produites et autorise
            le droit à l&apos;image, pour diffusion sur ses supports et ceux de ses partenaires
            (<Link href="/pimpmycourt/donnees" target="_blank" className="text-orange hover:underline">détails</Link>).
          </span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={sending} className="w-full rounded-full bg-orange text-black py-3 font-heading font-bold uppercase text-sm tracking-wide disabled:opacity-40 hover:bg-orange-light">
          {sending ? "Envoi…" : "Envoyer ma demande"}
        </button>
      </form>
    </main>
  );
}
