// Lecture publique de Supabase (clé publishable = publique, jamais la secrète).
// RLS + le verrouillage des colonnes credentials protègent le reste.
import { SITE_URL } from './config';

const SUPABASE_URL = 'https://focztgxwxdknnoudwvvd.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_i9ALTuVqGZc8qAFHqFILvA_oPGHEnec';

const HEADERS = { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${PUBLISHABLE_KEY}` };

export type Athlete = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  sport: string | null;
  position: string | null;
  level: string | null;
  country: string | null;
  profile_photo: string | null;
  bio: string | null;
  is_private: boolean | null;
  deletion_scheduled_at: string | null;
  grad_year: number | null;
  featured_titles: string[] | null;
};

// Libellés des titres (EN — le web public est anglais). Suit lib/achievements.ts de l'app.
export const TITLE_LABELS: { [id: string]: string } = {
  recruiters_fav: "RECRUITERS' FAVORITE", grinder: 'GRINDER', active: 'ACTIVE USER',
  complete: 'COMPLETE PROFILE', athletes_fav: "ATHLETES' FAVORITE", rising: 'RISING TALENT',
  fans_fav: "FANS' FAVORITE", team_player: 'TEAM PLAYER', available: 'AVAILABLE',
  group_admin: 'GROUP ADMIN', explorer: 'EXPLORER', loyal: 'LOYAL',
  endorse_friendly: 'SUPER FRIENDLY', endorse_teammate: 'GREAT TEAMMATE',
  endorse_play_with: 'FUN TO PLAY WITH', endorse_motivator: 'MOTIVATOR',
  endorse_disciplined: 'DISCIPLINED', endorse_group_loved: 'GROUP FAVORITE',
};

export type Post = {
  id: string;
  athlete_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  photo_urls: string[] | null;
  caption: string | null;
  media_type: string | null;
  sport: string | null;
  level: string | null;
  status: string | null;
  expires_at: string | null;
};

// public-card = porte service_role. Depuis la migration 0099, la RLS bloque la lecture ANON de la
// table `athletes` (anti-moisson des mineurs) → le web anon ne peut plus lire en direct. public-card
// (verify_jwt=false) renvoie SEULEMENT le sous-ensemble public et gate public/actif CÔTÉ SERVEUR.
async function publicCard<T>(kind: 'athlete' | 'post', id: string, key: 'athlete' | 'post'): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/public-card?kind=${kind}&id=${encodeURIComponent(id)}`, {
      headers: HEADERS,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const j = await res.json();
    return (j?.[key] ?? null) as T | null;
  } catch {
    return null;
  }
}

// Athlète PUBLIC seulement (public-card gate public + non supprimé côté serveur).
export async function getPublicAthlete(id: string): Promise<Athlete | null> {
  return publicCard<Athlete>('athlete', id, 'athlete');
}

// Post PUBLIC seulement (public-card gate déjà : actif, non expiré, ET auteur public+non supprimé).
export async function getPost(id: string): Promise<Post | null> {
  return publicCard<Post>('post', id, 'post');
}

export function fullName(a: Athlete): string {
  return [a.first_name, a.last_name].filter(Boolean).join(' ') || a.username || 'Athlete';
}

// Média du bucket PRIVÉ VIDEOS → passe par le proxy signé /img (sinon 403). URL externe = telle quelle.
export function imgProxy(url?: string | null): string {
  if (!url) return '';
  return url.includes('/VIDEOS/') ? `/img?u=${encodeURIComponent(url)}` : url;
}
// Vidéo du bucket PRIVÉ VIDEOS → proxy /vid qui REDIRIGE vers l'URL signée (streaming/Range natif).
// Ne PAS utiliser /img pour la vidéo (il bufferise tout). URL externe (CF, etc.) = telle quelle.
export function vidProxy(url?: string | null): string {
  if (!url) return '';
  return url.includes('/VIDEOS/') ? `/vid?u=${encodeURIComponent(url)}` : url;
}
// Version ABSOLUE pour OpenGraph (les crawlers sociaux exigent une URL absolue).
export function imgAbs(url?: string | null): string {
  const p = imgProxy(url);
  if (!p) return '';
  return p.startsWith('http') ? p : `${SITE_URL}${p}`;
}
