export type Reel = {
  id: string;
  permalink: string;
  thumbnail_url?: string;
  media_url?: string;
  caption?: string;
  views?: number | null;
  like_count?: number | null;
  comments_count?: number | null;
  shares?: number | null;
  saved?: number | null;
};
