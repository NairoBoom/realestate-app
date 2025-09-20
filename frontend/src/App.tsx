import { useEffect, useMemo, useState } from "react";
import { fetchProperties, fetchPropertyDetail } from "./api";
import type { Property, PropertyDetail } from "./api";
import "./styles.css";

const resolveImage = (path?: string) =>
  !path ? "" : path.startsWith("http") ? path : `/${path.replace(/^\//, "")}`;

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

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const data = await fetchProperties({ name, address, minPrice, maxPrice, sortBy, sortDir });
      setItems(data.items ?? []);
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    // 1. Limpio estados
    setName(""); 
    setAddress(""); 
    setMinPrice(""); 
    setMaxPrice("");
    setSortBy("price"); 
    setSortDir("desc");

    // 2. Llamo a load con filtros vacíos explícitos
    setLoading(true);
    setErr("");
    try {
      const data = await fetchProperties({ 
        name: "", 
        address: "", 
        minPrice: "", 
        maxPrice: "", 
        sortBy: "price", 
        sortDir: "desc" 
      });
      setItems(data.items ?? []);
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => { load(); }, []);
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

  return (
    <>
      <div className="bg-anim" />
      <div className="app-root">
        {/**/}
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

            {err && <div className="error">⚠️ {err}</div>}

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
                {detail?.traces?.length ? detail.traces.map(t => (
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
