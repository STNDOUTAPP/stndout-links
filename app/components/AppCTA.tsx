import { APP_STORE_URL, PLAY_STORE_URL } from '../../lib/config';

// Si les liens de store sont vides (pré-launch), on retombe sur un CTA générique.
export default function AppCTA({ label = 'GET STNDOUT' }: { label?: string }) {
  const store = APP_STORE_URL || PLAY_STORE_URL;
  if (store) {
    return (
      <>
        {APP_STORE_URL ? <a className="cta" href={APP_STORE_URL}>{label} · iOS</a> : null}
        {PLAY_STORE_URL ? (
          <a className={APP_STORE_URL ? 'cta-ghost' : 'cta'} href={PLAY_STORE_URL}>{label} · Android</a>
        ) : null}
      </>
    );
  }
  return <a className="cta" href="/">{label}</a>;
}
