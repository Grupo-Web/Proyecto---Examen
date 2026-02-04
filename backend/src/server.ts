/**
 * Server Entry Point
 * Inicia el servidor HTTP
 */

import { App } from './app.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const app = new App();
    await app.initialize();

    const expressApp = app.getApp();
    
    expressApp.listen(Number(PORT), () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Servidor iniciado correctamente                      ║
║                                                            ║
║   📍 URL: http://localhost:${PORT}                        ║
║   📡 API: http://localhost:${PORT}/api                    ║
║                                                            ║
║   📚 Endpoints disponibles:                               ║
║   • GET    /api/products                                  ║
║   • POST   /api/products                                  ║
║   • GET    /api/sales                                     ║
║   • POST   /api/sales                                     ║
║   • GET    /api/reports/sales                             ║
║   • GET    /api/reports/top-products                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // Manejo de errores del servidor
    process.on('SIGINT', async () => {
      console.log('\n🛑 Cerrando servidor...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Cerrando servidor...');
      await app.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();