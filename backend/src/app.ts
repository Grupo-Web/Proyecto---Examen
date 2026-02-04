/**
 * App.ts - Configuración principal de Express
 * Configura middleware, rutas y dependencias
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Infrastructure
import { getConnection } from './infrastructure/database/sqlite/sqlite.connection.js';
import { SQLiteProductRepository } from './infrastructure/repositories/product.repository.impl.js';
import { SQLiteSaleRepository } from './infrastructure/repositories/sale.repository.impl.js';

// Application
import { CreateSaleUseCase } from './application/create-sale.usecase.js';
import { GetSalesReportUseCase } from './application/get-sales-report.usecase.js';
import { ExportReportUseCase } from './application/export-report.usecase.js';

// Interfaces
import { ProductController } from './interfaces/controllers/product.controller.js';
import { SaleController } from './interfaces/controllers/sale.controller.js';
import { ReportController } from './interfaces/controllers/report.controller.js';
import { createProductRoutes } from './interfaces/routes/product.routes.js';
import { createSaleRoutes } from './interfaces/routes/sale.routes.js';
import { createReportRoutes } from './interfaces/routes/report.routes.js';

export async function createApp(): Promise<Application> {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logger middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Inicializar base de datos
  await getConnection();

  // Inicializar repositorios
  const productRepository = new SQLiteProductRepository();
  const saleRepository = new SQLiteSaleRepository();

  // Inicializar casos de uso
  const createSaleUseCase = new CreateSaleUseCase(saleRepository, productRepository);
  const getSalesReportUseCase = new GetSalesReportUseCase(saleRepository);
  const exportReportUseCase = new ExportReportUseCase(saleRepository);

  // Inicializar controladores
  const productController = new ProductController(productRepository);
  const saleController = new SaleController(createSaleUseCase, saleRepository);
  const reportController = new ReportController(getSalesReportUseCase, exportReportUseCase);

  // Rutas
  app.use('/api/products', createProductRoutes(productController));
  app.use('/api/sales', createSaleRoutes(saleController));
  app.use('/api/reports', createReportRoutes(reportController));

  // Ruta raíz
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: '🏪 API Sistema de Ventas Cafetería',
      version: '1.0.0',
      endpoints: {
        products: '/api/products',
        sales: '/api/sales',
        reports: '/api/reports'
      }
    });
  });

  // Ruta de health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Manejo de rutas no encontradas
  app.use((req: Request, res: Response) => {
    res.status(404).json({ 
      error: 'Ruta no encontrada',
      path: req.path 
    });
  });

  // Manejo de errores global
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: err.message 
    });
  });

  return app;
}