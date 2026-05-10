import type { Request, Response } from 'express'
import { rankingsService } from '../services/rankings.service'
import { authService } from '../services/auth.service'

export const rankingsController = {
  getAll(req: Request, res: Response): void {
    const rankings = req.userId
      ? rankingsService.getByUser(req.userId)
      : rankingsService.getPublic()
    res.json(rankings)
  },

  getById(req: Request, res: Response): void {
    const ranking = rankingsService.getById(req.params.id)
    if (!ranking) {
      res.status(404).json({ message: 'Ranking not found' })
      return
    }
    res.json(ranking)
  },

  create(req: Request, res: Response): void {
    try {
      const userId = req.userId!
      const user = authService.getUserById(userId)
      if (!user) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }
      if (!rankingsService.canCreate(userId, user.isPremium)) {
        res.status(403).json({ message: 'Free plan limit reached. Upgrade to Premium.' })
        return
      }
      const ranking = rankingsService.create({ ...req.body, userId })
      res.status(201).json(ranking)
    } catch (err) {
      res.status(400).json({ message: (err as Error).message })
    }
  },

  update(req: Request, res: Response): void {
    try {
      const userId = req.userId!
      const ranking = rankingsService.update(req.params.id, userId, req.body)
      res.json(ranking)
    } catch (err) {
      const status = (err as Error).message === 'Forbidden' ? 403 : 404
      res.status(status).json({ message: (err as Error).message })
    }
  },

  remove(req: Request, res: Response): void {
    try {
      const userId = req.userId!
      rankingsService.remove(req.params.id, userId)
      res.status(204).send()
    } catch (err) {
      const status = (err as Error).message === 'Forbidden' ? 403 : 404
      res.status(status).json({ message: (err as Error).message })
    }
  },
}
