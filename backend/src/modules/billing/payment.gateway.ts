import { PaymentMethod } from '../../generated/prisma/client.js'

export interface PaymentInput {
  amount: number
  method: PaymentMethod
  reference: string
}

export interface PaymentResult {
  success: boolean
  transactionReference: string
}

// Abstraction over the real provider (MercadoPago / bank transfer).
// Swap this stub for a real implementation without touching the service layer.
export interface PaymentGateway {
  pay(input: PaymentInput): Promise<PaymentResult>
}

// Stub: simulates a successful external payment. Deterministic enough for tests.
export const stubGateway: PaymentGateway = {
  async pay(input) {
    return {
      success: true,
      transactionReference: `STUB-${input.method}-${input.reference}-${Date.now()}`,
    }
  },
}
