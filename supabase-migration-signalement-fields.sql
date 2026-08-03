-- Pimp My Court — champs de signalement (à exécuter dans Supabase → SQL Editor)
-- Ajoute les colonnes du nouveau formulaire et met à jour la vue publique.

alter table public.terrains add column if not exists nom text;
alter table public.terrains add column if not exists age int;
alter table public.terrains add column if not exists contact_tiktok text;
alter table public.terrains add column if not exists nom_terrain text;
alter table public.terrains add column if not exists nb_filets_a_remplacer int;

drop view if exists public.terrains_public;
create view public.terrains_public as
  select id, latitude, longitude, ville, code_postal, departement,
         photo_avant_url, photo_apres_url, categorie,
         case when statut in ('pose_effectuee','rushes_recus') then 'remplace' else 'a_remplacer' end as etat,
         nb_confirmations, nb_paniers, nb_filets_a_remplacer, nom_terrain, prenom, commentaire, created_at
  from public.terrains
  where statut in ('verifie','kit_demande','kit_envoye','pose_effectuee','rushes_recus');
grant select on public.terrains_public to anon, authenticated;
