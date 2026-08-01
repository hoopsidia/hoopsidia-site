import "server-only";
import { Resend } from "resend";
import { BASE_URL } from "@/lib/constants";

// Transactional emails (§9). All sends are best-effort: a failure is logged but
// never breaks the request. Until a domain is verified in Resend, RESEND_FROM
// falls back to the test sender (which only delivers to the account owner).
const FROM = process.env.RESEND_FROM ?? "Pimp My Court <onboarding@resend.dev>";
const DELETE_URL = `${BASE_URL}/pimpmycourt/donnees`;

function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function shell(body: string): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#111">
    <h2 style="font-style:italic;text-transform:uppercase">Pimp My Court</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="font-size:12px;color:#888">Tu peux demander la suppression de tes données à tout moment : <a href="${DELETE_URL}">${DELETE_URL}</a></p>
  </div>`;
}

async function send(to: string, subject: string, body: string): Promise<void> {
  const client = resend();
  if (!client) return;
  try {
    await client.emails.send({ from: FROM, to, subject, html: shell(body) });
  } catch (e) {
    console.error("resend send error:", e);
  }
}

export function sendSignalementRecu(to: string): Promise<void> {
  return send(
    to,
    "Ton signalement est enregistré",
    `<p>Merci ! On vérifie ton terrain sous <b>48 h</b> avant qu'il apparaisse sur la carte.</p>
     <p>Tu veux poser les filets toi-même ? <a href="${BASE_URL}/pimpmycourt/kit">Demander un kit</a>.</p>`,
  );
}

export function sendTerrainValide(to: string, terrainId: string): Promise<void> {
  return send(
    to,
    "Ton terrain est en ligne",
    `<p>Ton terrain est désormais visible sur la carte des filets.</p>
     <p><a href="${BASE_URL}/pimpmycourt/terrain/${terrainId}">Voir sa fiche</a> — c'est le bon moment pour la partager.</p>`,
  );
}

export function sendKitApprouve(to: string): Promise<void> {
  return send(
    to,
    "Ta demande de kit est approuvée",
    `<p>Le kit part bientôt. Relis le <a href="${BASE_URL}/pimpmycourt/tournage">protocole de tournage</a> avant la pose.</p>`,
  );
}

export function sendKitLivre(to: string): Promise<void> {
  return send(
    to,
    "Ton kit est arrivé",
    `<p>Avant de sortir filmer : règle ton téléphone (HDR désactivé, 4K 30fps, vertical) et garde la liste de plans sous la main.</p>
     <p><a href="${BASE_URL}/pimpmycourt/tournage">Protocole complet</a>. Tu as 15 jours pour envoyer les rushes.</p>`,
  );
}

export function sendRelance(to: string): Promise<void> {
  return send(
    to,
    "Tes rushes Pimp My Court",
    `<p>Petit rappel : envoie tes rushes (fichiers originaux, jamais par WhatsApp/iMessage).</p>
     <p><a href="${BASE_URL}/pimpmycourt/tournage">Comment livrer</a>.</p>`,
  );
}
