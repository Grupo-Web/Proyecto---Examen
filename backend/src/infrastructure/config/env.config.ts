
export const config = {
  port: parseInt(process.env.PORT || '3000'),

  database: {
    path: process.env.DB_PATH || './data/cafeteria.db'
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};