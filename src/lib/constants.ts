export const HERO_STATS = {
  youtube: 113000,
  instagram: 71000,
  courts: 5,
  views: 50000000,
};

export const CLIENTS = [
  { name: "Tarmak", logo: "/logos/tarmak.png", hasLogo: true },
  { name: "NBA", logo: "/logos/nba.png", hasLogo: true },
  { name: "LNB", logo: "/logos/lnb.png", hasLogo: true },
  { name: "Euroleague", logo: "/logos/euroleague.png", hasLogo: true },
  { name: "France TV", logo: "/logos/francetv.png", hasLogo: true },
  { name: "Kellogg's", logo: "/logos/kelloggs.png", hasLogo: true },
  { name: "Spalding", logo: "/logos/spalding.png", hasLogo: true },
  { name: "OnCourt", logo: "/logos/oncourt.png", hasLogo: true },
  { name: "Mega Slam Hoops", logo: "/logos/megaslam.png", hasLogo: true },
  { name: "Stramatel", logo: "/logos/stramatel.png", hasLogo: true },
  { name: "Hoops Factory", logo: "/logos/hoopsfactory.png", hasLogo: true },
  { name: "Saint-Apollinaire", logo: "/logos/saint-apollinaire.png", hasLogo: true },
];

export const PMC_SEASONS = [
  {
    id: "s1",
    season: 1,
    youtubeId: "zRUHXt26hfI",
    playlistId: "PLs1FwAcUOToY7VnprrDTsrtyMjUQV_Kcs",
    thumbnail: "/images/logo-pmc.png",
  },
  {
    id: "s2",
    season: 2,
    youtubeId: "JUtZ8hTM-AI",
    playlistId: "PLs1FwAcUOToaTZ9TX1zPhROMeP5f4rK7p",
    thumbnail: "/images/logo-pmc.png",
  },
  {
    id: "s3",
    season: 3,
    youtubeId: null, // coming soon
    thumbnail: "/images/logo-pmc.png",
    comingSoon: true,
  },
];

export const SOCIAL_LINKS = {
  youtube: "https://www.youtube.com/@hoopsidia",
  instagram: "https://www.instagram.com/hoopsidia",
  tiktok: "https://www.tiktok.com/@hoopsidia",
};

// Placeholder Instagram stats (used when Meta API is not configured)
export const PLACEHOLDER_IG_STATS = {
  followers: 71000,
  engagementRate: 4.2,
  views30d: 2500000,
  averageReach: 35000,
  demographics: {
    gender: [
      { label: "M", value: 5300, percent: 75 },
      { label: "F", value: 1770, percent: 25 },
    ],
    countries: [
      { label: "FR", value: 4600, percent: 65 },
      { label: "US", value: 710, percent: 10 },
      { label: "BE", value: 500, percent: 7 },
      { label: "CH", value: 355, percent: 5 },
      { label: "CA", value: 285, percent: 4 },
    ],
    ages: [
      { label: "13-17", value: 500, percent: 7 },
      { label: "18-24", value: 2500, percent: 35 },
      { label: "25-34", value: 2800, percent: 40 },
      { label: "35-44", value: 850, percent: 12 },
      { label: "45+", value: 420, percent: 6 },
    ],
    cities: [
      { label: "Paris", value: 1420, percent: 20 },
      { label: "Lyon", value: 710, percent: 10 },
      { label: "Marseille", value: 500, percent: 7 },
      { label: "Toulouse", value: 355, percent: 5 },
      { label: "Bordeaux", value: 285, percent: 4 },
    ],
  },
  followerHistory: [
    { date: "2024-01", followers: 45000 },
    { date: "2024-03", followers: 48000 },
    { date: "2024-05", followers: 52000 },
    { date: "2024-07", followers: 55000 },
    { date: "2024-09", followers: 59000 },
    { date: "2024-11", followers: 63000 },
    { date: "2025-01", followers: 66000 },
    { date: "2025-03", followers: 68000 },
    { date: "2025-05", followers: 69500 },
    { date: "2025-07", followers: 70000 },
    { date: "2025-09", followers: 70500 },
    { date: "2026-01", followers: 71000 },
  ],
};
