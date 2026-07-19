// Proxy VIDÉO SIGNÉE pour les pages de partage.
// Le bucket VIDEOS est PRIVÉ (migr 0111) → un <source src="…/object/public/VIDEOS/…"> renvoie 403,
// donc une vidéo highlight partagée ne jouait pas (seul le poster passait via /img). Contrairement
// aux images, on ne bufferise PAS la vidéo (le /img fait arrayBuffer = inadapté au streaming) :
// on fait SIGNER l'URL par media-sign puis on REDIRIGE (302) vers l'URL signée Supabase, qui
// supporte nativement les requêtes Range → le <video> stream directement depuis le storage,
// zéro bande passante Vercel, seek/scrub OK.
import { NextRequest } from 'next/server';

const SUPABASE_URL = 'https://focztgxwxdknnoudwvvd.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_i9ALTuVqGZc8qAFHqFILvA_oPGHEnec';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get('u');
  if (!u || !u.includes('/VIDEOS/')) return new Response('bad request', { status: 400 });
  try {
    const signRes = await fetch(`${SUPABASE_URL}/functions/v1/media-sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: PUBLISHABLE_KEY,
        Authorization: `Bearer ${PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ url: u }),
    });
    if (!signRes.ok) return new Response('unavailable', { status: 404 });
    const j = await signRes.json();
    const signed: string | undefined = j?.urls?.[u];
    if (!signed) return new Response('not found', { status: 404 });

    // 302 vers l'URL signée (valide 1 h). Pas de cache : le jeton expire, on re-signe à chaque lecture.
    return new Response(null, {
      status: 302,
      headers: { Location: signed, 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response('error', { status: 502 });
  }
}
