"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type Pos = { lat: number; lng: number };
type Duplicate = { id: string; ville: string | null; nb_confirmations: number } | null;
type Phase = "form" | "duplicate" | "sending" | "done";

// Bottom sheet for reporting a court (§5). Position = current map centre (the
// crosshair overlay); the map stays pannable above the sheet. Friction-minimal:
// photo + email required, everything else optional behind a toggle.
export default function SignalementSheet({
  position,
  onClose,
}: {
  position: Pos;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("form");
  const [photo, setPhoto] = useState<File | null>(null);
  const [nbPaniers, setNbPaniers] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [prenom, setPrenom] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [consent, setConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<Duplicate>(null);
  const websiteRef = useRef<HTMLInputElement>(null); // honeypot

  const canSubmit =
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && consent && Number(nbPaniers) >= 1;

  async function handleSubmit() {
    setError(null);
    const pos = position;
    // Duplicate check first
    try {
      const res = await fetch("/api/pimpmycourt/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pos),
      });
      const data = await res.json();
      if (data.duplicate) {
        setDuplicate(data.duplicate);
        setPhase("duplicate");
        return;
      }
    } catch {
      /* non-blocking */
    }
    await create(pos);
  }

  async function create(pos: Pos) {
    setPhase("sending");
    setError(null);
    const fd = new FormData();
    fd.set("latitude", String(pos.lat));
    fd.set("longitude", String(pos.lng));
    fd.set("email", email);
    fd.set("contact_instagram", instagram);
    fd.set("prenom", prenom);
    fd.set("commentaire", commentaire);
    fd.set("consent", consent ? "1" : "");
    fd.set("nb_paniers", nbPaniers);
    fd.set("website", websiteRef.current?.value ?? "");
    if (photo) fd.set("photo", photo);
    try {
      const res = await fetch("/api/pimpmycourt/signalement", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "erreur");
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "erreur");
      setPhase("form");
    }
  }

  async function confirmDuplicate() {
    if (!duplicate) return;
    setPhase("sending");
    try {
      await fetch("/api/pimpmycourt/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terrain_id: duplicate.id, email }),
      });
      setPhase("done");
    } catch {
      setError("erreur");
      setPhase("duplicate");
    }
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 max-h-[75dvh] overflow-y-auto rounded-t-2xl bg-[#0d0d0d] border-t border-white/10 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold italic uppercase text-white">
            {phase === "done" ? "Terrain signalé" : "Signaler un terrain"}
          </h2>
          <button onClick={onClose} aria-label="Fermer" className="text-white/50 hover:text-white text-2xl leading-none">
            ×
          </button>
        </div>

        {phase === "done" && (
          <div className="text-white/80 space-y-4">
            <p className="text-sm">
              Merci ! On vérifie ton terrain sous <span className="text-orange font-bold">48 h</span>{" "}
              (modération manuelle) avant qu&apos;il apparaisse sur la carte.
            </p>
            <div className="rounded-xl glass-subtle p-4">
              <p className="font-heading font-bold text-white">Tu veux poser les filets toi-même ?</p>
              <p className="text-sm text-white/60 mt-1">On t&apos;envoie le matériel. En échange, tu filmes la pose.</p>
              <div className="mt-3 flex gap-2">
                <Link href="/pimpmycourt/tournage" className="flex-1 text-center rounded-full glass-subtle px-4 py-2 text-sm font-heading font-bold hover:bg-white/10">
                  Voir ce que ça implique
                </Link>
                <Link href="/pimpmycourt/kit" className="flex-1 text-center rounded-full bg-orange text-black px-4 py-2 text-sm font-heading font-bold hover:bg-orange-light">
                  Demander un kit
                </Link>
              </div>
            </div>
            <button onClick={onClose} className="w-full rounded-full glass-subtle py-2.5 text-sm font-heading font-bold hover:bg-white/10">
              Fermer
            </button>
          </div>
        )}

        {phase === "duplicate" && duplicate && (
          <div className="text-white/80 space-y-4">
            <p className="text-sm">
              Ce terrain {duplicate.ville ? `(${duplicate.ville})` : ""} est déjà signalé
              {duplicate.nb_confirmations > 1 ? ` — ${duplicate.nb_confirmations} confirmations` : ""}. Tu confirmes ?
            </p>
            <button onClick={confirmDuplicate} className="w-full rounded-full bg-orange text-black py-3 font-heading font-bold uppercase text-sm hover:bg-orange-light">
              Oui, je confirme
            </button>
            <button
              onClick={() => create(position)}
              className="w-full rounded-full glass-subtle py-2.5 text-sm font-heading font-bold hover:bg-white/10"
            >
              Ce n&apos;est pas le même terrain
            </button>
          </div>
        )}

        {(phase === "form" || phase === "sending") && (
          <div className="space-y-4">
            <p className="text-xs text-white/50">
              Position enregistrée. Indique le nombre de paniers et tes infos.
            </p>

            {/* Nombre de paniers — requis */}
            <label className="block">
              <span className="text-sm text-white/70">Combien de paniers ont besoin de filets ? *</span>
              <input
                type="number"
                min="1"
                value={nbPaniers}
                onChange={(e) => setNbPaniers(e.target.value)}
                placeholder="ex. 2"
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange"
              />
            </label>

            {/* Photo (facultatif) */}
            <label className="block">
              <span className="text-sm text-white/70">Photo du terrain <span className="text-white/40">(facultatif)</span></span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-orange file:px-4 file:py-2 file:text-black file:font-bold"
              />
              {photo && <span className="text-xs text-white/40">{photo.name}</span>}
            </label>

            {/* Email + instagram */}
            <label className="block">
              <span className="text-sm text-white/70">Email *</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.fr"
                className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange"
              />
            </label>

            {/* Honeypot (hidden) */}
            <input ref={websiteRef} type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            {!showDetails && (
              <button onClick={() => setShowDetails(true)} className="text-sm text-orange hover:underline">
                + Ajouter des détails (optionnel)
              </button>
            )}
            {showDetails && (
              <div className="space-y-3">
                <input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@ton_instagram (optionnel)"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange"
                />
                <input
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Prénom (optionnel)"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange"
                />
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value.slice(0, 300))}
                  placeholder="Commentaire (optionnel, 300 car. max)"
                  rows={2}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-orange"
                />
              </div>
            )}

            {/* Consent */}
            <label className="flex items-start gap-2 text-xs text-white/60">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              <span>
                J&apos;accepte que mes données soient traitées pour ce signalement (voir{" "}
                <a href="/pimpmycourt/donnees" className="text-orange hover:underline" target="_blank">politique de données</a>).
              </span>
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || phase === "sending"}
              className="w-full rounded-full bg-orange text-black py-3 font-heading font-bold uppercase text-sm tracking-wide disabled:opacity-40 hover:bg-orange-light transition"
            >
              {phase === "sending" ? "Envoi…" : "Signaler ce terrain"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
