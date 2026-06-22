// Lecture publique de Supabase (clé publishable = publique, jamais la secrète).
// RLS + le verrouillage des colonnes credentials protègent le reste.
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

async function rest<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: HEADERS,
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

// Renvoie l'athlète SEULEMENT s'il est public et non supprimé.
export async function getPublicAthlete(id: string): Promise<Athlete | null> {
  const cols =
    'id,first_name,last_name,username,sport,position,level,country,profile_photo,bio,is_private,deletion_scheduled_at,grad_year,featured_titles';
  const rows = await rest<Athlete>(`athletes?id=eq.${encodeURIComponent(id)}&select=${cols}`);
  const a = rows[0];
  if (!a) return null;
  if (a.is_private) return null; // jamais exposer un profil privé
  if (a.deletion_scheduled_at) return null; // ni un compte en suppression
  return a;
}

export async function getPost(id: string): Promise<Post | null> {
  const cols =
    'id,athlete_id,video_url,thumbnail_url,photo_urls,caption,media_type,sport,level,status,expires_at';
  const rows = await rest<Post>(`posts?id=eq.${encodeURIComponent(id)}&select=${cols}`);
  const p = rows[0];
  if (!p) return null;
  if (p.status && p.status !== 'active') return null;
  if (p.expires_at && new Date(p.expires_at) < new Date()) return null; // post 24h expiré
  return p;
}

export function fullName(a: Athlete): string {
  return [a.first_name, a.last_name].filter(Boolean).join(' ') || a.username || 'Athlete';
}
