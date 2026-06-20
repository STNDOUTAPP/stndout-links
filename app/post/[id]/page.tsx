import type { Metadata } from 'next';
import { getPost, getPublicAthlete, fullName } from '../../../lib/db';
import AppCTA from '../../components/AppCTA';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost(params.id);
  if (!p) return { title: 'STNDOUT' };
  const a = p.athlete_id ? await getPublicAthlete(p.athlete_id) : null;
  const who = a ? fullName(a) : 'An athlete';
  const title = `${who} on STNDOUT`;
  const desc = p.caption || [p.sport, p.level].filter(Boolean).join(' · ') || 'Play. Post. Get Discovered.';
  const image = p.thumbnail_url || (p.photo_urls && p.photo_urls[0]) || a?.profile_photo || '';
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: image ? [image] : [],
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: image ? [image] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const p = await getPost(params.id);

  if (!p) {
    return (
      <main className="wrap">
        <div className="card">
          <div className="brand">STNDOUT</div>
          <div className="brand-line" />
          <div className="empty">
            <h1>Private or unavailable</h1>
            <p>This highlight is private, was removed, or is only shared inside the app. Open STNDOUT and sign in to view it — if the athlete shared it with you.</p>
          </div>
          <AppCTA label="OPEN IN STNDOUT" />
        </div>
      </main>
    );
  }

  const a = p.athlete_id ? await getPublicAthlete(p.athlete_id) : null;
  const photos = p.photo_urls && p.photo_urls.length > 0 ? p.photo_urls : null;

  return (
    <main className="wrap">
      <div className="card">
        <div className="brand">STNDOUT</div>
        <div className="brand-line" />

        {a ? (
          <>
            <h1 className="name" style={{ fontSize: 20 }}>{fullName(a)}</h1>
            {a.username ? <p className="username" style={{ marginBottom: 18 }}>@{a.username}</p> : null}
          </>
        ) : null}

        <div className="media">
          {photos ? (
            <div className="gallery">
              {photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`photo ${i + 1}`} />
              ))}
            </div>
          ) : p.video_url ? (
            <video controls playsInline poster={p.thumbnail_url || undefined} preload="metadata">
              <source src={p.video_url} />
            </video>
          ) : p.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.thumbnail_url} alt="post" />
          ) : null}
        </div>

        {p.caption ? <p className="bio">{p.caption}</p> : null}

        <AppCTA label="OPEN IN STNDOUT" />

        <p className="slogan">
          PLAY. <span className="gold">POST.</span> GET DISCOVERED.
        </p>
      </div>
    </main>
  );
}
