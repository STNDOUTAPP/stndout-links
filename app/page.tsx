import AppCTA from './components/AppCTA';

export default function Home() {
  return (
    <main className="wrap">
      <div className="card">
        <div className="brand">STNDOUT</div>
        <div className="brand-line" />
        <p className="bio" style={{ marginTop: 24 }}>
          The sports recruiting platform. Athletes get discovered. Recruiters find talent.
        </p>
        <AppCTA />
        <p className="slogan">
          PLAY. <span className="gold">POST.</span> GET DISCOVERED.
        </p>
      </div>
    </main>
  );
}
