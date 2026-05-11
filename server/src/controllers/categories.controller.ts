import type { Request, Response } from 'express'
import { categoriesService } from '../services/categories.service'
import { rankingsService } from '../services/rankings.service'
import { authService } from '../services/auth.service'

export const categoriesController = {
  getAll(_req: Request, res: Response): void {
    res.json(categoriesService.getAll())
  },

  create(req: Request, res: Response): void {
    const user = authService.getUserById(req.userId!)
    if (!user?.isPremium) {
      res.status(403).json({ message: 'Premium required to add categories' })
      return
    }
    try {
      const { label } = req.body
      if (!label) {
        res.status(400).json({ message: 'label is required' })
        return
      }
      const category = categoriesService.add(label)
      res.status(201).json(category)
    } catch (err) {
      res.status(409).json({ message: (err as Error).message })
    }
  },

  remove(req: Request, res: Response): void {
    const user = authService.getUserById(req.userId!)
    if (!user?.isPremium) {
      res.status(403).json({ message: 'Premium required to remove categories' })
      return
    }
    try {
      rankingsService.removeByCategory(req.userId!, req.params.value)
      categoriesService.remove(req.params.value)
      res.status(204).send()
    } catch (err) {
      res.status(404).json({ message: (err as Error).message })
    }
  },
}
