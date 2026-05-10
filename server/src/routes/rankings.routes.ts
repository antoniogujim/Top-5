import { Router } from 'express'
import { rankingsController } from '../controllers/rankings.controller'
import { requireAuth, optionalAuth } from './middleware'

const router = Router()

router.get('/', optionalAuth, rankingsController.getAll)
router.get('/:id', rankingsController.getById)
router.post('/', requireAuth, rankingsController.create)
router.put('/:id', requireAuth, rankingsController.update)
router.delete('/:id', requireAuth, rankingsController.remove)

export default router
