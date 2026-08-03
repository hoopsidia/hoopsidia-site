-- Pimp My Court — replacement date
-- A terrain is "remplacé" (green) once date_remplacement is set. The public
-- view exposes the date and derives `etat` from it, so it's visible publicly.
--
-- We DROP + CREATE the view (inside one transaction, so there's no window where
-- it's missing): CREATE OR REPLACE VIEW can't reorder/insert columns, DROP+CREATE
-- can.

begin;

alter table terrains add column if not exists date_remplacement date;

drop view if exists terrains_public;

create view terrains_public as
select
  id,
  latitude,
  longitude,
  ville,
  code_postal,
  departement,
  photo_avant_url,
  photo_apres_url,
  categorie,
  case when date_remplacement is not null then 'remplace' else 'a_remplacer' end as etat,
  date_remplacement,
  nb_confirmations,
  nb_paniers,
  nb_filets_a_remplacer,
  nom_terrain,
  prenom,
  commentaire,
  created_at
from terrains
where statut = 'verifie';

grant select on terrains_public to anon, authenticated;

commit;
