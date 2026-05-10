import jwt from 'jsonwebtoken'
import { config } from '../config'
import type { User, JwtPayload } from '../types'

const users: User[] = [
  { id: '1', username: 'demo', email: 'demo@example.com', password: '123456', isPremium: false },
  { id: '2', username: 'premium', email: 'premium@example.com', password: '123456', isPremium: true },
]

export const authService = {
  findByEmail(email: string): User | undefined {
    return users.find((u) => u.email === email)
  },

  register(username: string, email: string, password: string): User {
    if (users.find((u) => u.email === email)) {
      throw new Error('Email already in use')
    }
    const user: User = {
      id: String(Date.now()),
      username,
      email,
      password,
      isPremium: false,
    }
    users.push(user)
    return user
  },

  login(email: string, password: string): string {
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid credentials')
    const payload: JwtPayload = { userId: user.id, email: user.email }
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
  },

  getUserById(id: string): Omit<User, 'password'> | undefined {
    const user = users.find((u) => u.id === id)
    if (!user) return undefined
    const { password: _, ...safeUser } = user
    return safeUser
  },
}
