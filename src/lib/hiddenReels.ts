// Reels hidden from the site's reels grid (not deleted from Instagram).
// Add an Instagram media id here to keep that reel off hoopsidia.com.
// The reels API filters these out before taking the 12 most recent.
// A reel can also be hidden by putting #noweb / #essai / #test / #brouillon
// in its caption — see src/app/api/instagram/reels/route.ts.
export const HIDDEN_REEL_IDS: ReadonlySet<string> = new Set([
  "18152826637536173",
  "17901880194375033",
  "18111321067891735",
  "17908932963483514",
  "17968253327963867",
  "18080656673527695",
  "18115505197824489",
  "18072413093754431",
  "18180215695439960",
  "17986818014881453",
  "18131818468777646",
  "18071680478753668",
  "18076634990483643",
  "17924906682199722",
  "18110503963895852",
  "18106949495349800",
  "18138508540617178",
  "18104732966629031",
  "18015473816959589",
  "18108600602461388",
  "18056809250574452",
  "18134447293639714",
  "18009336095995732",
  "18636711208052687",
  "18020377097947264",
  "18105590857973343",
]);
