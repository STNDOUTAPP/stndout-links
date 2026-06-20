'use client';
import { useEffect } from 'react';

// Page de retour après la vérification d'identité Stripe.
// Stripe redirige ici (https) une fois la vérif faite → on renvoie vers l'app
// (scheme stndout://) pour que le navigateur se ferme et que l'app reprenne le flux.
export default function IdentityReturn() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = 'stndout://identity-return';
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="wrap">
      <div className="card">
        <div className="brand">STNDOUT</div>
        <div className="brand-line" />
        <p className="bio" style={{ marginTop: 24, fontSize: 18, color: '#C9A84C' }}>
          ✓ Identité vérifiée
        </p>
        <p className="bio" style={{ marginTop: 8 }}>
          Tu peux retourner à l&apos;application pour finaliser ta demande.
        </p>
        <a href="stndout://identity-return" className="cta">Retourner à STNDOUT</a>
        <p className="slogan">
          PLAY. <span className="gold">POST.</span> GET DISCOVERED.
        </p>
      </div>
    </main>
  );
}
