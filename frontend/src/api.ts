const API = import.meta.env.VITE_API_BASE ?? "http://localhost:5016";

// Tipos del listado
export type Property = {
  idProperty: number;
  idOwner: number;
  name: string;
  address: string;
  price: number;
  image?: string;
};

// Tipos del detalle
export type OwnerDto = {
  idOwner: number;
  name: string;
  address: string;
  photo: string;
  birthday: string; // ISO
};

export type PropertyTraceDto = {
  idPropertyTrace: number;
  dateSale: string; // ISO
  name: string;
  value: number;
  tax: number;
};

export type PropertyDetail = {
  idOwner: number;
  name: string;
  address: string;
  price: number;
  codeInternal: string;
  year: number;
  images: string[];
  owner?: OwnerDto | null;
  traces: PropertyTraceDto[];
};

// Filtros
export type Filters = {
  name?: string;
  address?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

// Listado
export async function fetchProperties(f: Filters) {
  const params = new URLSearchParams();
  if (f.name) params.set("name", f.name);
  if (f.address) params.set("address", f.address);
  if (f.minPrice) params.set("minPrice", f.minPrice);
  if (f.maxPrice) params.set("maxPrice", f.maxPrice);
  if (f.sortBy) params.set("sortBy", f.sortBy);
  if (f.sortDir) params.set("sortDir", f.sortDir);
  params.set("page", String(f.page ?? 1));
  params.set("pageSize", String(f.pageSize ?? 20));

  const res = await fetch(`${API}/api/properties?${params.toString()}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json() as Promise<{ items: Property[]; total: number }>;
}

// Detalle
export async function fetchPropertyDetail(id: number) {
  const res = await fetch(`${API}/api/properties/${id}`);
  if (!res.ok) throw new Error(`Detalle no encontrado (${res.status})`);
  return res.json() as Promise<PropertyDetail>;
}
