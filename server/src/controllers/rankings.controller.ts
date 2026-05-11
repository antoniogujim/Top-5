import type { Request, Response } from 'express'
import { rankingsService } from '../services/rankings.service'
import { authService } from '../services/auth.service'

export const rankingsController = {
  getAll(req: Request, res: Response): void {
    const page     = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit    = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 9))
    const category = (req.query.category as string) || undefined
    const { data, total } = req.userId
      ? rankingsService.getByUser(req.userId, page, limit, category)
      : rankingsService.getPublic(page, limit, category)
    res.json({ data, total, page, pages: Math.ceil(total / limit) || 1 })
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
    const { title, category, items } = req.body
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ message: 'title is required' })
      return
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      res.status(400).json({ message: 'category is required' })
      return
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'items must be a non-empty array' })
      return
    }
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
    const { title, category, items } = req.body
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      res.status(400).json({ message: 'title must be a non-empty string' })
      return
    }
    if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
      res.status(400).json({ message: 'category must be a non-empty string' })
      return
    }
    if (items !== undefined && (!Array.isArray(items) || items.length === 0)) {
      res.status(400).json({ message: 'items must be a non-empty array' })
      return
    }
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
