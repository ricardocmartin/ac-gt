const { HashRouter, Routes, Route, Link, useParams } = ReactRouterDOM;
const { useEffect, useRef, useState } = React;

const DEFAULT_SETTINGS = {
  musicVolume: 0.55,
  effectsVolume: 0.85,
};

function useLoopMusic(src, volume) {
  const audioRef = useRef(null);

  useEffect(() => {
    const bgm = new Audio(src);
    bgm.loop = true;
    bgm.volume = Math.max(0, Math.min(1, volume));
    audioRef.current = bgm;

    function tryPlay() {
      bgm.play().catch(() => {});
    }

    tryPlay();
    window.addEventListener("pointerdown", tryPlay);

    return () => {
      window.removeEventListener("pointerdown", tryPlay);
      bgm.pause();
      bgm.currentTime = 0;
      audioRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);
}

function useUiSounds(effectsVolume) {
  const audioRef = useRef({
    ctx: null,
    master: null,
    compressor: null,
    lastHoverEl: null,
    lastHoverAt: 0,
    userActivated: false,
    effectsVolume,
  });
  audioRef.current.effectsVolume = effectsVolume;

  useEffect(() => {
    const state = audioRef.current;

    function ensureContext() {
      if (state.ctx) return true;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      state.ctx = new AudioCtx();
      state.compressor = state.ctx.createDynamicsCompressor();
      state.compressor.threshold.value = -22;
      state.compressor.knee.value = 18;
      state.compressor.ratio.value = 3;
      state.compressor.attack.value = 0.004;
      state.compressor.release.value = 0.12;
      state.master = state.ctx.createGain();
      state.master.gain.value = 0.48 * state.effectsVolume;
      state.master.connect(state.compressor);
      state.compressor.connect(state.ctx.destination);
      return true;
    }

    function playVoice({ start, end, type, gainPeak, duration, attack, release, filterHz, filterQ = 0.9 }) {
      const { ctx, master } = state;
      if (!ctx || !master) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(filterHz, now);
      filter.Q.setValueAtTime(filterQ, now);

      osc.type = type;
      osc.frequency.setValueAtTime(start, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), now + duration);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(gainPeak, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + release);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    function playTone(kind) {
      if (!ensureContext()) return;
      const { ctx } = state;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      if (kind === "hover") {
        playVoice({
          start: 880,
          end: 1020,
          type: "triangle",
          gainPeak: 0.12,
          duration: 0.055,
          attack: 0.006,
          release: 0.07,
          filterHz: 3000,
        });
        return;
      }

      if (kind === "cancel") {
        playVoice({
          start: 510,
          end: 290,
          type: "triangle",
          gainPeak: 0.22,
          duration: 0.11,
          attack: 0.007,
          release: 0.13,
          filterHz: 1800,
          filterQ: 1.1,
        });
        playVoice({
          start: 260,
          end: 190,
          type: "sine",
          gainPeak: 0.18,
          duration: 0.13,
          attack: 0.01,
          release: 0.15,
          filterHz: 1400,
        });
        return;
      }

      playVoice({
        start: 620,
        end: 980,
        type: "square",
        gainPeak: 0.2,
        duration: 0.07,
        attack: 0.005,
        release: 0.085,
        filterHz: 2600,
      });
      playVoice({
        start: 940,
        end: 1320,
        type: "triangle",
        gainPeak: 0.12,
        duration: 0.055,
        attack: 0.004,
        release: 0.075,
        filterHz: 3600,
      });
    }

    function onPointerOver(event) {
      if (!state.userActivated) return;
      const optionEl = event.target.closest(".sfx-option");
      if (!optionEl) return;
      const now = Date.now();
      if (state.lastHoverEl === optionEl && now - state.lastHoverAt < 80) return;
      state.lastHoverEl = optionEl;
      state.lastHoverAt = now;
      playTone("hover");
    }

    function onPointerOut(event) {
      if (!event.target.closest(".sfx-option")) return;
      if (state.lastHoverEl && !event.relatedTarget?.closest?.(".sfx-option")) {
        state.lastHoverEl = null;
      }
    }

    function onClick(event) {
      const optionEl = event.target.closest(".sfx-option, .sfx-cancel");
      if (!optionEl) return;
      state.userActivated = true;
      if (optionEl.classList.contains("sfx-cancel")) {
        playTone("cancel");
      } else {
        playTone("confirm");
      }
    }

    function onActivate() {
      state.userActivated = true;
      ensureContext();
    }

    window.addEventListener("pointerover", onPointerOver);
    window.addEventListener("pointerout", onPointerOut);
    window.addEventListener("click", onClick);
    window.addEventListener("pointerdown", onActivate, { once: true });
    window.addEventListener("keydown", onActivate, { once: true });

    return () => {
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointerdown", onActivate);
      window.removeEventListener("keydown", onActivate);
    };
  }, []);

  useEffect(() => {
    const state = audioRef.current;
    if (!state.master || !state.ctx) return;
    const now = state.ctx.currentTime;
    const nextGain = 0.48 * effectsVolume;
    state.master.gain.cancelScheduledValues(now);
    state.master.gain.linearRampToValueAtTime(nextGain, now + 0.05);
  }, [effectsVolume]);
}

function Splash() {
  return (
    <main className="splash-screen">
      <img className="brand-logo" src="../assets/logo.png" alt="GT Edition" />

      <nav className="splash-menu">
        <Link to="/arcade" className="splash-option sfx-option">
          <span className="option-mark arcade-mark" />
          <span>Arcade</span>
        </Link>
        <Link to="/simulation" className="splash-option sfx-option">
          <span className="option-mark simulation-mark" />
          <span>Simulation</span>
        </Link>
        <Link to="/options" className="splash-option sfx-option">
          <span className="option-mark options-mark" />
          <span>Opções</span>
        </Link>
      </nav>
    </main>
  );
}

function ArcadeMenu({ musicVolume }) {
  useLoopMusic("../music/arcade.mp3", musicVolume);

  const arcadeOptions = [
    { label: "Single Race", to: "/arcade/single-race", color: "arcade-green" },
    { label: "Time Trial", to: "/arcade/time-trial", color: "arcade-red" },
    { label: "Multi Player", to: "/arcade/multi-player", color: "arcade-blue" },
    { label: "Bonus Itens", to: "/arcade/bonus-itens", color: "arcade-purple" },
  ];

  return (
    <section className="arcade-screen">
      <div className="arcade-panel">
        <h2 className="arcade-title">Arcade Mode</h2>
        <nav className="arcade-menu">
          {arcadeOptions.map((item) => (
            <Link key={item.label} to={item.to} className="arcade-option sfx-option">
              <span className={`arcade-bullet ${item.color}`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <Link className="arcade-back sfx-cancel" to="/">Voltar</Link>
      </div>
    </section>
  );
}

function SimulationMap({ musicVolume }) {
  useLoopMusic("../music/menu_theme.mp3", musicVolume);

  const brands = [
    { name: "Aston Martin", top: "12%", left: "12%" },
    { name: "Dodge", top: "9%", left: "43%" },
    { name: "TVR", top: "11%", left: "74%" },
    { name: "Mazda", top: "33%", left: "19%" },
    { name: "Toyota", top: "28%", left: "55%" },
    { name: "Mitsubishi", top: "36%", left: "76%" },
    { name: "Nissan", top: "63%", left: "24%" },
    { name: "Honda/Acura", top: "58%", left: "60%" },
    { name: "Subaru", top: "82%", left: "32%" },
    { name: "Chevrolet", top: "84%", left: "66%" },
  ];

  const menuNodes = [
    { name: "Garagem", to: "/garage", top: "74%", left: "52%", kind: "menu" },
    { name: "Eventos", to: "/events", top: "58%", left: "42%", kind: "menu" },
    { name: "Licenças", to: "/licenses", top: "67%", left: "72%", kind: "menu" },
    { name: "Testes", to: "/tests", top: "48%", left: "13%", kind: "menu" },
    { name: "Sair", to: "/", top: "90%", left: "86%", kind: "exit" },
  ];

  return (
    <section className="simulation-screen">
      <div className="simulation-map">
        {brands.map((brand) => (
          <Link
            key={brand.name}
            to={`/brand/${encodeURIComponent(brand.name)}`}
            className="map-node brand-node sfx-option"
            style={{ top: brand.top, left: brand.left }}
          >
            <span className="node-icon">●</span>
            <span className="node-label">{brand.name}</span>
          </Link>
        ))}

        {menuNodes.map((item) => (
          <Link
            key={item.name}
            to={item.to}
            className={`map-node ${item.kind === "exit" ? "exit-node sfx-cancel" : "menu-node sfx-option"}`}
            style={{ top: item.top, left: item.left }}
          >
            <span className="node-label">{item.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BrandScreen({ musicVolume }) {
  const { name } = useParams();
  const brandName = decodeURIComponent(name || "");
  useLoopMusic("../music/shop.mp3", musicVolume);

  const showroomOptions = [
    { label: "Carros Novos", to: `/brand/${encodeURIComponent(brandName)}/new-cars` },
    { label: "Carros Usados", to: `/brand/${encodeURIComponent(brandName)}/used-cars` },
    { label: "Modelo Especial", to: `/brand/${encodeURIComponent(brandName)}/special-model` },
    { label: "Tunning", to: `/brand/${encodeURIComponent(brandName)}/tunning` },
  ];

  const sideMenu = [
    { label: "Garagem", to: "/garage", icon: "G" },
    { label: "Eventos", to: "/events", icon: "E" },
    { label: "Teste", to: "/tests", icon: "T" },
    { label: "Licensas", to: "/licenses", icon: "L" },
  ];

  return (
    <section className="brand-screen">
      <img className="brand-bg-car" src="../assets/splash-screen.png" alt="" />
      <header className="brand-header">
        <h2>{brandName.toUpperCase()}</h2>
        <span>MAIN</span>
      </header>

      <aside className="brand-side">
        <Link to="/simulation" className="brand-exit sfx-cancel">EXIT</Link>
        {sideMenu.map((item) => (
          <Link key={item.label} to={item.to} className="brand-side-link sfx-option" title={item.label}>
            <span className="brand-side-icon">{item.icon}</span>
          </Link>
        ))}
      </aside>

      <main className="brand-content">
        <div className="brand-title-mark">{brandName.toUpperCase()}</div>
        <nav className="brand-options">
          {showroomOptions.map((item) => (
            <Link key={item.label} to={item.to} className="brand-option sfx-option">
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </main>

      <footer className="brand-footer">
        <span>Day 1</span>
        <span>Cr 10,000</span>
        <span>My Car</span>
      </footer>
    </section>
  );
}

function BrandSubScreen() {
  const { name, section } = useParams();
  const brandName = decodeURIComponent(name || "");
  const sectionTitleByKey = {
    "new-cars": "Carros Novos",
    "used-cars": "Carros Usados",
    "special-model": "Modelo Especial",
    tunning: "Tunning",
  };
  const sectionTitle = sectionTitleByKey[section] || "Concessionária";

  return (
    <section className="mode-screen">
      <h2>{brandName}</h2>
      <p>{sectionTitle} em construção.</p>
      <Link className="back-link sfx-cancel" to={`/brand/${encodeURIComponent(brandName)}`}>Voltar</Link>
    </section>
  );
}

function ModeScreen({ title, backTo = "/" }) {
  return (
    <section className="mode-screen">
      <h2>{title}</h2>
      <p>Tela em construção.</p>
      <Link className="back-link sfx-cancel" to={backTo}>Voltar</Link>
    </section>
  );
}

function OptionsScreen({ settings, onChange }) {
  return (
    <section className="mode-screen">
      <h2>Opções</h2>
      <div style={{ width: "min(560px, 92vw)", textAlign: "left", background: "rgba(0,0,0,0.38)", padding: "16px", border: "1px solid rgba(255,255,255,0.35)" }}>
        <label style={{ display: "block", marginBottom: "18px" }}>
          <div style={{ marginBottom: "8px", fontWeight: "700" }}>Volume da Música: {Math.round(settings.musicVolume * 100)}%</div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(settings.musicVolume * 100)}
            onChange={(e) => onChange("musicVolume", Number(e.target.value) / 100)}
            style={{ width: "100%" }}
          />
        </label>
        <label style={{ display: "block" }}>
          <div style={{ marginBottom: "8px", fontWeight: "700" }}>Volume dos Efeitos: {Math.round(settings.effectsVolume * 100)}%</div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(settings.effectsVolume * 100)}
            onChange={(e) => onChange("effectsVolume", Number(e.target.value) / 100)}
            style={{ width: "100%" }}
          />
        </label>
      </div>
      <Link className="back-link sfx-cancel" to="/">Voltar</Link>
    </section>
  );
}

function App() {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem("gt_settings");
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return {
        musicVolume: typeof parsed.musicVolume === "number" ? parsed.musicVolume : DEFAULT_SETTINGS.musicVolume,
        effectsVolume: typeof parsed.effectsVolume === "number" ? parsed.effectsVolume : DEFAULT_SETTINGS.effectsVolume,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem("gt_settings", JSON.stringify(settings));
  }, [settings]);

  function updateSetting(key, value) {
    const clamped = Math.max(0, Math.min(1, value));
    setSettings((prev) => ({ ...prev, [key]: clamped }));
  }

  useUiSounds(settings.effectsVolume);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/arcade" element={<ArcadeMenu musicVolume={settings.musicVolume} />} />
        <Route path="/arcade/single-race" element={<ModeScreen title="Single Race" backTo="/arcade" />} />
        <Route path="/arcade/time-trial" element={<ModeScreen title="Time Trial" backTo="/arcade" />} />
        <Route path="/arcade/multi-player" element={<ModeScreen title="Multi Player" backTo="/arcade" />} />
        <Route path="/arcade/bonus-itens" element={<ModeScreen title="Bonus Itens" backTo="/arcade" />} />
        <Route path="/simulation" element={<SimulationMap musicVolume={settings.musicVolume} />} />
        <Route path="/options" element={<OptionsScreen settings={settings} onChange={updateSetting} />} />
        <Route path="/garage" element={<ModeScreen title="Garagem" backTo="/simulation" />} />
        <Route path="/events" element={<ModeScreen title="Eventos" backTo="/simulation" />} />
        <Route path="/licenses" element={<ModeScreen title="Licenças" backTo="/simulation" />} />
        <Route path="/tests" element={<ModeScreen title="Testes" backTo="/simulation" />} />
        <Route path="/brand/:name" element={<BrandScreen musicVolume={settings.musicVolume} />} />
        <Route path="/brand/:name/:section" element={<BrandSubScreen />} />
      </Routes>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
