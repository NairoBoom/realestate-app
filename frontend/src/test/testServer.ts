import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

type Item = {
  idProperty: number
  name: string
  address: string
  price: number
  idOwner: number
  image: string
}

const DATA: Item[] = [
  {
    idProperty: 101,
    name: 'Apartamento Norte',
    address: 'Cll 123 #45-67',
    price: 350000000,
    idOwner: 1,
    image: 'img/apto-1.jpg'
  },
  {
    idProperty: 102,
    name: 'Casa Central',
    address: 'Cra 10 #20-30',
    price: 780000000,
    idOwner: 2,
    image: 'img/casa-1.jpg'
  }
]

// util de ordenamiento
function sortItems(arr: Item[], by: string, dir: 'asc' | 'desc'): Item[] {
  const mul = dir === 'asc' ? 1 : -1
  const copy = [...arr]
  switch (by) {
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name) * mul)
    case 'address':
      return copy.sort((a, b) => a.address.localeCompare(b.address) * mul)
    case 'id':
      return copy.sort((a, b) => (a.idProperty - b.idProperty) * mul)
    case 'price':
    default:
      return copy.sort((a, b) => (a.price - b.price) * mul)
  }
}

export const handlers = [
  // GET /api/properties con filtros
  http.get('http://localhost:5016/api/properties', ({ request }) => {
    const url = new URL(request.url)
    const name = (url.searchParams.get('name') || '').toLowerCase()
    const address = (url.searchParams.get('address') || '').toLowerCase()
    const minPrice = Number(url.searchParams.get('minPrice') || '0')
    const maxPrice = Number(url.searchParams.get('maxPrice') || Number.MAX_SAFE_INTEGER)
    const sortBy = url.searchParams.get('sortBy') || 'price'
    const sortDir = (url.searchParams.get('sortDir') as 'asc' | 'desc') || 'desc'

    let items = DATA.filter(i => {
      const okName = name ? i.name.toLowerCase().includes(name) : true
      const okAddr = address ? i.address.toLowerCase().includes(address) : true
      const okMin = i.price >= minPrice
      const okMax = i.price <= maxPrice
      return okName && okAddr && okMin && okMax
    })

    items = sortItems(items, sortBy, sortDir)

    return HttpResponse.json({ items })
  }),

  // GET /api/properties/:id detalle
  http.get('http://localhost:5016/api/properties/:id', ({ params }) => {
    const id = Number(params.id)
    const base =
      id === 101
        ? {
            idProperty: 101,
            name: 'Apartamento Norte',
            address: 'Cll 123 #45-67',
            price: 350000000
          }
        : {
            idProperty: 102,
            name: 'Casa Central',
            address: 'Cra 10 #20-30',
            price: 780000000
          }

    return HttpResponse.json({
      ...base,
      year: 2020,
      codeInternal: 'P-001',
      owner: { name: 'John Doe', address: 'Av 1 # 2-3', birthday: '1990-01-01' },
      images: ['img/apto-1.jpg', 'img/apto-2.jpg'],
      traces: [
        { idPropertyTrace: 1, name: 'Venta', dateSale: '2022-04-01', value: base.price, tax: 2000000 }
      ]
    })
  })
]

export const server = setupServer(...handlers)
