import { Router } from 'express'
import { categoriesController } from '../controllers/categories.controller'
import { requireAuth } from './middleware'

const router = Router()

router.get('/', categoriesController.getAll)
router.post('/', requireAuth, categoriesController.create)
router.delete('/:value', requireAuth, categoriesController.remove)

export default router
