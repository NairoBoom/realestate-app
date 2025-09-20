import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

beforeEach(() => {
  // Limpia el DOM entre tests
  document.body.innerHTML = ''
})

describe('App - listado y filtros', () => {
  it('muestra título y carga cards desde API', async () => {
    render(<App />)

    // título
    expect(await screen.findByRole('heading', { name: /Propiedades/i })).toBeInTheDocument()

    // cards
    const cards = await screen.findAllByRole('listitem')
    expect(cards.length).toBeGreaterThanOrEqual(2)

    // una card conocida
    expect(screen.getByText(/Apartamento Norte/i)).toBeInTheDocument()
  })

  it('filtra por nombre y resetea', async () => {
    const user = userEvent.setup()
    render(<App />)

    // aseguramos estado inicial
    expect(await screen.findByText(/Casa Central/i)).toBeInTheDocument()

    // filtrar por "Apar" (de "Apartamento")
    const inputNombre = screen.getByPlaceholderText('Nombre')
    await user.clear(inputNombre)
    await user.type(inputNombre, 'Apar')

    // Buscar
    await user.click(screen.getByRole('button', { name: /Buscar/i }))

    // ahora NO debe estar "Casa Central"
    expect(screen.queryByText(/Casa Central/i)).not.toBeInTheDocument()

    // Reset
    await user.click(screen.getByRole('button', { name: /Reset filtros/i }))

    // vuelve a aparecer
    expect(await screen.findByText(/Casa Central/i)).toBeInTheDocument()
  })

  it('abre modal de detalle al hacer click en una card', async () => {
    const user = userEvent.setup()
    render(<App />)

    // click en la card "Apartamento Norte"
    await user.click(await screen.findByText(/Apartamento Norte/i))

    // modal como dialog
    const dialog = await screen.findByRole('dialog')
    // dentro del modal: título y secciones
    expect(within(dialog).getByRole('heading', { name: /Apartamento Norte/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: /Información/i })).toBeInTheDocument()
    // En vez de getByText /Propietario/ global, pedimos el heading dentro del modal
    expect(within(dialog).getByRole('heading', { name: /Propietario/i })).toBeInTheDocument()

    // cerrar
    await user.click(within(dialog).getByRole('button', { name: '✕' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
