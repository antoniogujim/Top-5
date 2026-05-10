export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
  freeListLimit: 10,
}
