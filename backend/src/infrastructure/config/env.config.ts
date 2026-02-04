/**
 * Environment Config - Infrastructure Layer
 * Configuración de variables de entorno
 */

export const config = {
  // Puerto del servidor
  port: parseInt(process.env.PORT || '3000'),

  // Configuración de base de datos
  database: {
    path: process.env.DB_PATH || './data/cafeteria.db'
  },

  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  // Configuración de ambiente
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};