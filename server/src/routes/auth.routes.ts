import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { requireAuth } from './middleware'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', requireAuth, authController.me)
router.post('/upgrade', requireAuth, authController.upgrade)
router.post('/downgrade', requireAuth, authController.downgrade)

export default router
