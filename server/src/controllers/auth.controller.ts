import type { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { rankingsService } from '../services/rankings.service'
import { config } from '../config'

export const authController = {
  register(req: Request, res: Response): void {
    try {
      const { username, email, password } = req.body
      if (!username || !email || !password) {
        res.status(400).json({ message: 'username, email and password are required' })
        return
      }
      const user = authService.register(username, email, password)
      const { password: _password, ...safeUser } = user
      res.status(201).json(safeUser)
    } catch (err) {
      res.status(409).json({ message: (err as Error).message })
    }
  },

  login(req: Request, res: Response): void {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        res.status(400).json({ message: 'email and password are required' })
        return
      }
      const token = authService.login(email, password)
      res.json({ token })
    } catch (err) {
      res.status(401).json({ message: (err as Error).message })
    }
  },

  me(req: Request, res: Response): void {
    const user = authService.getUserById(req.userId ?? '')
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    res.json(user)
  },

  upgrade(req: Request, res: Response): void {
    try {
      const user = authService.upgradeToPremium(req.userId ?? '')
      res.json(user)
    } catch (err) {
      res.status(404).json({ message: (err as Error).message })
    }
  },

  downgrade(req: Request, res: Response): void {
    try {
      const userId = req.userId ?? ''
      const user = authService.downgradeToFree(userId)
      rankingsService.trimToLimit(userId, config.freeListLimit)
      res.json(user)
    } catch (err) {
      res.status(404).json({ message: (err as Error).message })
    }
  },
}
