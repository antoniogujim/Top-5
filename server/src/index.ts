import express from 'express'
import cors from 'cors'
import { config } from './config'
import authRoutes from './routes/auth.routes'
import rankingsRoutes from './routes/rankings.routes'
import categoriesRoutes from './routes/categories.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/rankings', rankingsRoutes)
app.use('/api/categories', categoriesRoutes)

// Only listen when running locally (Vercel handles this in production)
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`)
  })
}

export default app
