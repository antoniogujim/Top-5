import type { Request, Response } from 'express'
import { categoriesService } from '../services/categories.service'

export const categoriesController = {
  getAll(_req: Request, res: Response): void {
    res.json(categoriesService.getAll())
  },

  create(req: Request, res: Response): void {
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
    try {
      categoriesService.remove(req.params.value)
      res.status(204).send()
    } catch (err) {
      res.status(404).json({ message: (err as Error).message })
    }
  },
}
