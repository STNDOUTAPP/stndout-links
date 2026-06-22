import type { Metadata } from 'next';
import { getPublicAthlete, fullName, TITLE_LABELS } from '../../../lib/db';
import { SLOGAN } from '../../../lib/config';
import AppCTA from '../../components/AppCTA';

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getPublicAthlete(params.id);
  if (!a) return { title: 'STNDOUT' };
  const name = fullName(a);
  const desc = a.bio || [a.sport, a.position, a.country].filter(Boolean).join(' · ') || SLOGAN;
  const title = `${name} — ${a.sport || 'Athlete'} | STNDOUT`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: a.profile_photo ? [a.profile_photo] : [],
      type: 'profile',
    },
    twitter: {
      card: a.profile_photo ? 'summary_large_image' : 'summary',
      title,
      description: desc,
      images: a.profile_photo ? [a.profile_photo] : [],
    },
  };
}

export default async function AthletePage({ params }: Props) {
  const a = await getPublicAthlete(params.id);

  if (!a) {
    return (
      <main className="wrap">
        <div className="card">
          <div className="brand">STNDOUT</div>
          <div className="brand-line" />
          <div className="empty">
            <h1>Profile not available</h1>
            <p>This profile is private or no longer exists.</p>
          </div>
          <AppCTA />
        </div>
      </main>
    );
  }

  const name = fullName(a);
  const tags = [a.sport, a.position, a.level, a.country].filter(Boolean) as string[];
  const titles = (a.featured_titles || []).map((id) => TITLE_LABELS[id]).filter(Boolean) as string[];

  return (
    <main className="wrap">
      <div className="card">
        <div className="brand">STNDOUT</div>
        <div className="brand-line" />

        {a.profile_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="avatar" src={a.profile_photo} alt={name} />
        ) : (
          <div className="avatar-fallback">{(a.first_name || 'A').charAt(0).toUpperCase()}</div>
        )}

        <h1 className="name">{name}</h1>
        {a.username ? <p className="username">@{a.username}</p> : null}

        {tags.length > 0 ? (
          <div className="tags">
            {tags.map((tg, i) => (
              <span className="tag" key={i}>{tg.toUpperCase()}</span>
            ))}
          </div>
        ) : null}

        {a.grad_year ? <p className="grad">CLASS OF {a.grad_year}</p> : null}

        {titles.length > 0 ? (
          <div className="titles">
            {titles.map((tl, i) => (
              <span className="title-chip" key={i}>{tl}</span>
            ))}
          </div>
        ) : null}

        {a.bio ? <p className="bio">{a.bio}</p> : null}

        <AppCTA label="VIEW ON STNDOUT" />

        <p className="slogan">
          PLAY. <span className="gold">POST.</span> GET DISCOVERED.
        </p>
      </div>
    </main>
  );
}
