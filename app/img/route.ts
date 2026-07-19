// Proxy d'image SIGNÉE pour les pages de partage.
// Le bucket VIDEOS est PRIVÉ (migr 0111) → une <img src="…/object/public/VIDEOS/…"> renvoie 403,
// ce qui cassait les photos ET l'aperçu OpenGraph des liens partagés (fuite virale). Ce proxy
// prend l'URL brute stockée, la fait SIGNER par media-sign (service_role côté serveur), récupère
// les octets et les sert depuis NOTRE domaine → URL stable, jamais expirée pour le partage/crawlers.
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

    const img = await fetch(signed);
    if (!img.ok) return new Response('not found', { status: 404 });
    const buf = await img.arrayBuffer();
    return new Response(buf, {
      headers: {
        'Content-Type': img.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new Response('error', { status: 502 });
  }
}
