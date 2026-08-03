-- Pimp My Court — replacement date
-- A terrain is "remplacé" (green) once date_remplacement is set. The public
-- view exposes the date and derives `etat` from it, so it's visible publicly.
--
-- NOTE: CREATE OR REPLACE VIEW cannot reorder/insert columns — existing columns
-- must keep their exact order; new columns are appended at the END.

alter table terrains add column if not exists date_remplacement date;

create or replace view terrains_public as
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
  nb_confirmations,
  nb_paniers,
  nb_filets_a_remplacer,
  nom_terrain,
  prenom,
  commentaire,
  created_at,
  date_remplacement
from terrains
where statut = 'verifie';

grant select on terrains_public to anon, authenticated;
