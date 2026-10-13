import { useEffect, useState } from 'react';
import { araclar } from './tools';

const rota = () => location.hash.replace(/^#\/?/, '');

export default function App() {
  const [r, setR] = useState(rota());
  useEffect(() => {
    const f = () => setR(rota());
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  const arac = araclar.find((a) => a.id === r);
  const Bilesen = arac?.component;
  return (
    <div className="app">
      <header className="ust">
        {arac ? <a className="geri" href="#/">‹ Ana menü</a> : null}
        <h1>{arac ? arac.ad : 'Emlak Araçları'}</h1>
      </header>
      <main>
        {Bilesen ? (
          <Bilesen />
        ) : (
          <div className="kartlar">
            {araclar.map((a) => (
              <a key={a.id} className="arac-kart" href={`#/${a.id}`}>
                <span className="ikon">{a.ikon}</span>
                <span><strong>{a.ad}</strong><small>{a.aciklama}</small></span>
              </a>
            ))}
          </div>
        )}
      </main>
      <footer>Emlak Araçları v{__APP_VERSION__}</footer>
    </div>
  );
}
