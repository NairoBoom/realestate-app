import { useEffect, useMemo, useState, useRef } from "react";
import { fetchProperties, fetchPropertyDetail } from "./api";
import type { Property, PropertyDetail } from "./api";
import "./styles.css";

const resolveImage = (path?: string) =>
  !path ? "" : path.startsWith("http") ? path : `/${path.replace(/^\//, "")}`;

type ViewMode = "classic" | "showcase" | "carrusel";

export default function App() {
  const [items, setItems] = useState<Property[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<string>("price");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<PropertyDetail | null>(null);
  const [detailImg, setDetailImg] = useState<string>("");
  const [detailLoading, setDetailLoading] = useState(false);

  // Vistas
  const [view, setView] = useState<ViewMode>("classic");

  // Showcase
  const [heroIndex, setHeroIndex] = useState(0);
  const featured = useMemo(() => [...items].sort((a, b) => b.price - a.price).slice(0, 3), [items]);

  // carrusel
  const [fIndex, setFIndex] = useState(0);
  const [fPaused, setFPaused] = useState(false);
  const futurals = items; // usamos toda la lista

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const data = await fetchProperties({ name, address, minPrice, maxPrice, sortBy, sortDir });
      setItems(data.items ?? []);
      setHeroIndex(0);
      setFIndex(0);
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setName(""); setAddress(""); setMinPrice(""); setMaxPrice("");
    setSortBy("price"); setSortDir("desc");

    setLoading(true); setErr("");
    try {
      const data = await fetchProperties({
        name: "", address: "", minPrice: "", maxPrice: "", sortBy: "price", sortDir: "desc"
      });
      setItems(data.items ?? []);
      setHeroIndex(0);
      setFIndex(0);
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* on mount */ }, []);
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); load(); };

  const openDetail = async (p: Property) => {
    try {
      setDetail(null); setDetailImg(""); setDetailLoading(true); setOpen(true);
      const d = await fetchPropertyDetail(p.idProperty);
      setDetail(d);
      const first = (d.images?.[0]) ? resolveImage(d.images[0]) : resolveImage(p.image);
      setDetailImg(first);
    } finally { setDetailLoading(false); }
  };

  const formatCOP = useMemo(
    () => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }),
    []
  );

  useEffect(() => {
    if (view !== "showcase" || featured.length <= 1) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % featured.length), 5000);
    return () => clearInterval(t);
  }, [view, featured.length]);

  const HeroSlide = ({ p, active }: { p: Property; active: boolean }) => {
    const src = resolveImage(p.image);
    return (
      <div className={`hero__slide ${active ? "is-active" : ""}`} role="group" aria-roledescription="slide" aria-label={p.name || "Propiedad"}>
        <div className="hero__media">{src && <img src={src} alt={p.name} />}</div>
        <div className="hero__overlay" />
        <div className="hero__content">
          <div className="chip">Destacado</div>
          <h3>{p.name || "Sin título"}</h3>
          <p className="hero__addr">{p.address}</p>
          <div className="hero__price">{formatCOP.format(p.price)}</div>
          <button className="btn btn-hero" onClick={() => openDetail(p)}>Ver detalle</button>
        </div>
      </div>
    );
  };

  const goF = (dir: number) => {
    if (!futurals.length) return;
    setFIndex(i => (i + dir + futurals.length) % futurals.length);
  };

  useEffect(() => {
    if (view !== "carrusel" || futurals.length <= 1) return;
    const id = setInterval(() => { if (!fPaused) goF(1); }, 4000);
    return () => clearInterval(id);
  }, [view, futurals.length, fPaused]);

  useEffect(() => {
    if (view !== "carrusel") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goF(1);
      if (e.key === "ArrowLeft") goF(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, futurals.length]);

  const slideStyle = (i: number) => {
    const n = futurals.length || 1;
    const half = Math.floor(n / 2);
    let delta = i - fIndex;
    if (delta > half) delta -= n;
    if (delta < -half) delta += n;

    const abs = Math.abs(delta);
    const baseX = window.innerWidth < 680 ? 160 : 240; 
    const translateX = delta * baseX;
    const rotateY = delta * -18;                
    const translateZ = -abs * 90 + (abs === 0 ? 120 : 0); 
    const scale = 1 - Math.min(abs * 0.08, 0.4);
    const zIndex = 100 - abs;
    const opacity = 1 - Math.min(abs * 0.14, 0.65);

    return {
      transform: `translate(-50%,-50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex,
      opacity,
    } as React.CSSProperties;
  };

  return (
    <>
      <div className="bg-anim" />
      <div className="app-root">
        <div className="page">
          <main className="container">
            <h1 className="title">Inmobiliaria</h1>

            <form className="filters" onSubmit={onSubmit}>
              <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
              <input placeholder="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} />
              <input placeholder="Precio mín" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} inputMode="numeric" />
              <input placeholder="Precio máx" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} inputMode="numeric" />

              <button className="btn" type="submit" disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
              </button>

              <div className="actions">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="price">Precio</option>
                  <option value="name">Nombre</option>
                  <option value="address">Dirección</option>
                  <option value="id">ID</option>
                </select>
                <select value={sortDir} onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}>
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
                <button className="btn btn-reset" onClick={reset} type="button" disabled={loading}>
                  Reset filtros
                </button>
              </div>
            </form>

            {/* Switch de vista */}
            <div className="view-switch" role="tablist" aria-label="Cambiar vista">
              <button
                role="tab" aria-selected={view === "classic"}
                className={`view-pill ${view === "classic" ? "is-active" : ""}`}
                onClick={() => setView("classic")}
              >Clásica</button>
              <button
                role="tab" aria-selected={view === "showcase"}
                className={`view-pill ${view === "showcase" ? "is-active" : ""}`}
                onClick={() => setView("showcase")}
              >Showcase</button>
              <button
                role="tab" aria-selected={view === "carrusel"}
                className={`view-pill ${view === "carrusel" ? "is-active" : ""}`}
                onClick={() => setView("carrusel")}
              >carrusel</button>
            </div>

            {err && <div className="error">⚠️ {err}</div>}

            {/* ===== VISTA SHOWCASE ===== */}
            {view === "showcase" && (
              <>
                <section className="hero" aria-roledescription="carousel" aria-label="Destacados">
                  <div className="hero__track">
                    {featured.map((p, i) => (
                      <HeroSlide key={p.idProperty} p={p} active={heroIndex === i} />
                    ))}
                  </div>
                  {featured.length > 1 && (
                    <div className="hero__dots">
                      {featured.map((_, i) => (
                        <button
                          key={i}
                          aria-label={`Ir al slide ${i + 1}`}
                          aria-current={heroIndex === i}
                          onClick={() => setHeroIndex(i)}
                          type="button"
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* grilla showcase */}
                {loading ? (
                  <ul className="showcase-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <li key={i} className="show-card skel">
                        <div className="show-media skel" />
                        <div className="show-body">
                          <div className="skel-line" />
                          <div className="skel-line" style={{ width: "60%" }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : items.length === 0 ? (
                  <div className="empty">No se encontraron propiedades.</div>
                ) : (
                  <ul className="showcase-grid">
                    {items.map((p) => {
                      const src = resolveImage(p.image);
                      return (
                        <li key={p.idProperty} className="show-card" onClick={() => openDetail(p)} style={{ cursor: "pointer" }}>
                          <div className="glow-border" />
                          <div className="show-media">{src && <img src={src} alt={p.name} loading="lazy" />}</div>
                          <div className="show-over">
                            <span className="pill">{formatCOP.format(p.price)}</span>
                            <span className="over-addr">{p.address}</span>
                          </div>
                          <div className="show-body">
                            <h4>{p.name || "Sin título"}</h4>
                            <button className="btn btn-ghost" type="button">Ver detalle</button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            {/* ===== VISTA CLÁSICA ===== */}
            {view === "classic" && (
              <>
                {loading ? (
                  <ul className="grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <li key={i} className="skeleton">
                        <div className="skel-thumb" />
                        <div className="skel-body">
                          <div className="skel-line" style={{ width: "70%" }} />
                          <div className="skel-line" style={{ width: "50%" }} />
                          <div className="skel-line" style={{ width: "30%" }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : items.length === 0 ? (
                  <div className="empty">No se encontraron propiedades.</div>
                ) : (
                  <ul className="grid">
                    {items.map((p) => {
                      const src = resolveImage(p.image);
                      return (
                        <li key={p.idProperty} className="card" onClick={() => openDetail(p)} style={{ cursor: "pointer" }}>
                          <div className="thumb">
                            {src && <img src={src} alt={p.name} loading="lazy" width={1200} height={900} />}
                          </div>
                          <div className="card-body">
                            <div className="card-title">{p.name || "Sin título"}</div>
                            <div className="addr">{p.address}</div>
                            <div className="price">{formatCOP.format(p.price)}</div>
                            <small className="addr">Propietario #{p.idOwner}</small>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            {/* ===== VISTA carrusel (Carrusel 3D) ===== */}
            {view === "carrusel" && (
              <>
                {loading ? (
                  <div className="empty">Cargando…</div>
                ) : futurals.length === 0 ? (
                  <div className="empty">No se encontraron propiedades.</div>
                ) : (
                  <section
                    className="futura"
                    aria-roledescription="carousel"
                    aria-label="Carrusel carrusel de propiedades"
                    onMouseEnter={() => setFPaused(true)}
                    onMouseLeave={() => setFPaused(false)}
                  >
                    <div className="futura-track">
                      {futurals.map((p, i) => {
                        const src = resolveImage(p.image);
                        const isCenter = i === fIndex;
                        return (
                          <article
                            key={p.idProperty}
                            className={`futura-card ${isCenter ? "is-center" : ""}`}
                            style={slideStyle(i)}
                            onClick={() => openDetail(p)}
                            aria-roledescription="slide"
                            aria-label={p.name || `Propiedad ${i + 1}`}
                          >
                            {src && <img src={src} alt={p.name} loading="lazy" />}
                            <div className="futura-glass">
                              <div className="futura-title">{p.name || "Sin título"}</div>
                              <div className="futura-meta">
                                <span className="futura-price">{formatCOP.format(p.price)}</span>
                                <span className="futura-dot" />
                                <span className="futura-addr">{p.address}</span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <div className="futura-nav" aria-hidden="false">
                      <button aria-label="Anterior" onClick={() => goF(-1)}>‹</button>
                      <button aria-label="Siguiente" onClick={() => goF(1)}>›</button>
                    </div>

                    <div className="futura-dots">
                      {futurals.map((_, i) => (
                        <button
                          key={i}
                          aria-label={`Ir al slide ${i + 1}`}
                          aria-current={fIndex === i}
                          onClick={() => setFIndex(i)}
                          type="button"
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="property-dialog-title" onClick={(e) => e.stopPropagation()}>
            <header>
              <h3 id="property-dialog-title">{detail?.name ?? "Cargando..."}</h3>
              <button className="close" onClick={() => setOpen(false)} >✕</button>
            </header>
            <div className="body">
              <div className="gallery">
                <div className="main">{detailImg && <img src={detailImg} alt={detail?.name ?? ""} />}</div>
                <div className="thumbs">
                  {(detail?.images ?? []).map((img, idx) => (
                    <img key={idx} src={resolveImage(img)} alt={`img-${idx}`} onClick={() => setDetailImg(resolveImage(img))}/>
                  ))}
                </div>
              </div>
              <div className="detail-columns">
                <div className="detail-box">
                  <h4>Información</h4>
                  <div className="kv"><strong>Dirección:</strong> {detail?.address}</div>
                  <div className="kv"><strong>Precio:</strong> {detail ? formatCOP.format(detail.price) : "—"}</div>
                  <div className="kv"><strong>Año:</strong> {detail?.year}</div>
                  <div className="kv"><strong>Código interno:</strong> {detail?.codeInternal}</div>
                </div>
                <div className="detail-box">
                  <h4>Propietario</h4>
                  {detail?.owner ? (
                    <>
                      <div className="kv"><strong>Nombre:</strong> {detail.owner.name}</div>
                      <div className="kv"><strong>Dirección:</strong> {detail.owner.address}</div>
                      <div className="kv"><strong>Nacimiento:</strong> {new Date(detail.owner.birthday).toLocaleDateString()}</div>
                    </>
                  ) : (<div className="kv">Sin información de propietario.</div>)}
                </div>
              </div>
              <div className="traces">
                <h4>Historial</h4>
                {detailLoading ? (
                  <div className="kv">Cargando…</div>
                ) : detail?.traces?.length ? detail.traces.map(t => (
                  <div className="trace-row" key={t.idPropertyTrace}>
                    <div>{t.name} — {new Date(t.dateSale).toLocaleDateString()}</div>
                    <div>{formatCOP.format(t.value)}</div>
                    <div>Impuesto: {formatCOP.format(t.tax)}</div>
                  </div>
                )) : (<div className="kv">Sin registros.</div>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
