
import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, closeDatabase } from './infrastructure/database/sqlite/sqlite.connection.js';

import { ProductRepositoryImpl } from './infrastructure/repositories/product.repository.impl.js';
import { SaleRepositoryImpl } from './infrastructure/repositories/sale.repository.impl.js';

import { SaleController } from './interfaces/controllers/sale.controller.js';
import { ReportController } from './interfaces/controllers/report.controller.js';

import { ProductRoutes } from './interfaces/routes/product.routes.js';
import { SaleRoutes } from './interfaces/routes/sale.routes.js';
import { ReportRoutes } from './interfaces/routes/report.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class App {
  private app: Application;
  private saleController!: SaleController;
  private reportController!: ReportController;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    const frontendPath = path.join(__dirname, '../../frontend');
    this.app.use(express.static(frontendPath));
  }

  async initialize(): Promise<void> {
    try {
      console.log('📦 Inicializando base de datos...');
      await getDatabase();
      console.log('✅ Base de datos inicializada correctamente\n');

      const productRepository = new ProductRepositoryImpl();
      const saleRepository = new SaleRepositoryImpl();

      this.saleController = new SaleController(saleRepository, productRepository);
      this.reportController = new ReportController(saleRepository, productRepository);

      this.initializeRoutes();

      console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar la aplicación:', error);
      throw error;
    }
  }

  private initializeRoutes(): void {

    this.app.use('/api/products', new ProductRoutes().getRouter());

    this.app.use('/api/sales', new SaleRoutes(this.saleController).getRouter());
    this.app.use('/api/reports', new ReportRoutes(this.reportController).getRouter());

    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../../frontend/index.html'));
    });

    this.app.use((req, res) => {
      res.status(404).json({ 
        error: 'Ruta no encontrada',
        message: `La ruta ${req.path} no existe en esta API`
      });
    });
  }

  getApp(): Application {
    return this.app;
  }

  async close(): Promise<void> {
    await closeDatabase();
    console.log('🔒 Conexión a la base de datos cerrada');
  }
}