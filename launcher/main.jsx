const { HashRouter, Routes, Route, Link } = ReactRouterDOM;

function Splash() {
  return (
    <div>
      <h1>Bem-vindo ao GT Edition</h1>
      <Link className="menu-btn" to="/map">Modo Carreira</Link>
      <button className="menu-btn disabled" disabled>
        Replays (em breve)
      </button>
      <button className="menu-btn disabled" disabled>
        Modo Arcade (em breve)
      </button>
    </div>
  );
}

function Mapa() {
  return (
    <nav>
      <Link to="/garage">Garagem</Link>
      <Link to="/licenses">Licenças</Link>
      <Link to="/market">Concessionárias</Link>
      <Link to="/events">Corridas</Link>
      <Link to="/workshop">Oficina</Link>
    </nav>
  );
}

const Placeholder = ({ title }) => <h2>{title}</h2>;

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/map" element={<Mapa />} />
        <Route path="/garage" element={<Placeholder title="Garagem" />} />
        <Route path="/licenses" element={<Placeholder title="Licenças" />} />
        <Route path="/market" element={<Placeholder title="Concessionárias" />} />
        <Route path="/events" element={<Placeholder title="Corridas" />} />
        <Route path="/workshop" element={<Placeholder title="Oficina" />} />
      </Routes>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
