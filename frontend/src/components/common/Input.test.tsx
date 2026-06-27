import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('asocia el label con el campo', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('muestra el error y marca aria-invalid', () => {
    render(<Input label="Email" error="Email inválido" />)
    expect(screen.getByText('Email inválido')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('dispara onChange al escribir', async () => {
    const onChange = vi.fn()
    render(<Input label="Nombre" onChange={onChange} />)
    await userEvent.type(screen.getByLabelText('Nombre'), 'Ana')
    expect(onChange).toHaveBeenCalled()
  })
})
