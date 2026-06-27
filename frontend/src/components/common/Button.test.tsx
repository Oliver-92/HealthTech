import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renderiza su contenido', () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('dispara onClick al hacer clic', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('queda deshabilitado mientras isLoading', () => {
    render(<Button isLoading>Enviando</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('no dispara onClick cuando está deshabilitado', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>No</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
