/**
 * Application Entry Point
 * Configura Express, inicializa la base de datos y define las rutas
 */

import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, closeDatabase } from './infrastructure/database/sqlite/sqlite.connection.js';

// Repositorios
import { ProductRepositoryImpl } from './infrastructure/repositories/product.repository.impl.js';
import { SaleRepositoryImpl } from './infrastructure/repositories/sale.repository.impl.js';

// Controladores
// NOTA: Ya no importamos ProductController porque ProductRoutes lo maneja internamente
import { SaleController } from './interfaces/controllers/sale.controller.js';
import { ReportController } from './interfaces/controllers/report.controller.js';

// Rutas
import { ProductRoutes } from './interfaces/routes/product.routes.js';
import { SaleRoutes } from './interfaces/routes/sale.routes.js';
import { ReportRoutes } from './interfaces/routes/report.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class App {
  private app: Application;
  // private productController!: ProductController; // ELIMINADO: Ya no lo gestiona App
  private saleController!: SaleController;
  private reportController!: ReportController;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
  }

  /**
   * Inicializa middlewares de Express
   */
  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Servir archivos estáticos del frontend
    const frontendPath = path.join(__dirname, '../../frontend');
    this.app.use(express.static(frontendPath));
  }

  /**
   * Inicializa la base de datos y las dependencias
   */
  async initialize(): Promise<void> {
    try {
      // Inicializar base de datos
      console.log('📦 Inicializando base de datos...');
      await getDatabase();
      console.log('✅ Base de datos inicializada correctamente\n');

      // Inicializar repositorios
      // MANTENEMOS ESTO: Aunque ProductRoutes crea su propio repositorio internamente,
      // SaleController y ReportController TODAVÍA necesitan acceder a la tabla de productos.
      const productRepository = new ProductRepositoryImpl();
      const saleRepository = new SaleRepositoryImpl();

      // Inicializar controladores
      // ELIMINADO: this.productController = new ProductController(...) -> Lo hace ProductRoutes
      
      // Ventas y Reportes siguen usando la inyección manual (como estaba antes)
      this.saleController = new SaleController(saleRepository, productRepository);
      this.reportController = new ReportController(saleRepository, productRepository);

      // Configurar rutas
      this.initializeRoutes();

      console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar la aplicación:', error);
      throw error;
    }
  }

  /**
   * Configura las rutas de la API
   */
  private initializeRoutes(): void {
    // Rutas de API
    
    // CAMBIO IMPORTANTE: Instanciamos ProductRoutes sin argumentos ()
    // Ahora ProductRoutes se encarga de crear su propio controlador y casos de uso.
    this.app.use('/api/products', new ProductRoutes().getRouter());

    // Las rutas de ventas y reportes siguen igual
    this.app.use('/api/sales', new SaleRoutes(this.saleController).getRouter());
    this.app.use('/api/reports', new ReportRoutes(this.reportController).getRouter());

    // Ruta por defecto - sirve index.html
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../../frontend/index.html'));
    });

    // Manejo de rutas no encontradas
    this.app.use((req, res) => {
      res.status(404).json({ 
        error: 'Ruta no encontrada',
        message: `La ruta ${req.path} no existe en esta API`
      });
    });
  }

  /**
   * Obtiene la instancia de Express
   */
  getApp(): Application {
    return this.app;
  }

  /**
   * Cierra la conexión a la base de datos
   */
  async close(): Promise<void> {
    await closeDatabase();
    console.log('🔒 Conexión a la base de datos cerrada');
  }
}