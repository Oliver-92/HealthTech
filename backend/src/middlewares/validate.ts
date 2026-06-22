import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

type Target = 'body' | 'params' | 'query'

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      next(result.error)
      return
    }
    // Express 5 makes req.query read-only, so the coerced/validated data is
    // exposed on req.validatedQuery instead. body and params are reassigned in place.
    if (target === 'query') {
      req.validatedQuery = result.data
    } else {
      req[target] = result.data
    }
    next()
  }
}
