import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import type { JwtPayload } from '../types'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' })
    return
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload
    ;(req as any).userId = payload.userId
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
