import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('no renderiza nada cuando open=false', () => {
    render(<Modal open={false} onClose={() => {}} title="Hola">contenido</Modal>)
    expect(screen.queryByText('contenido')).not.toBeInTheDocument()
  })

  it('renderiza título y contenido cuando open=true', () => {
    render(<Modal open onClose={() => {}} title="Detalle">cuerpo</Modal>)
    expect(screen.getByText('Detalle')).toBeInTheDocument()
    expect(screen.getByText('cuerpo')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('cierra con la tecla Escape', () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="X">c</Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('cierra al hacer clic en el backdrop', async () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="X">c</Modal>)
    const backdrop = screen.getByRole('dialog').querySelector('[aria-hidden="true"]')
    await userEvent.click(backdrop as Element)
    expect(onClose).toHaveBeenCalled()
  })

  it('cierra con el botón de cerrar', async () => {
    const onClose = vi.fn()
    render(<Modal open onClose={onClose} title="X">c</Modal>)
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalled()
  })
})
