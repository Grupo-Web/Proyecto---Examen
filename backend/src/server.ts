/**
 * Server.ts - Punto de entrada de la aplicación
 * Inicia el servidor Express
 */

import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const app = await createApp();
    
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('🏪 Sistema de Ventas Cafetería - Backend');
      console.log('═══════════════════════════════════════════');
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`✅ API disponible en http://localhost:${PORT}/api`);
      console.log('');
      console.log('📋 Endpoints disponibles:');
      console.log(`   • GET  http://localhost:${PORT}/api/products`);
      console.log(`   • POST http://localhost:${PORT}/api/sales`);
      console.log(`   • GET  http://localhost:${PORT}/api/reports/sales`);
      console.log('');
      console.log('🏗️  Arquitectura: Hexagonal (Clean Architecture)');
      console.log('💾 Base de datos: SQLite');
      console.log('');
      console.log('Presiona CTRL+C para detener el servidor');
      console.log('═══════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();