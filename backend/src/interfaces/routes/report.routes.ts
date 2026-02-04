/**
 * Report Routes - Define las rutas para reportes y estadísticas
 */

import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';

export class ReportRoutes {
  private router: Router;
  private controller: ReportController;

  constructor(controller: ReportController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /api/reports/sales - Obtener reporte de ventas
    this.router.get('/sales', this.controller.getSalesReport.bind(this.controller));

    // GET /api/reports/top-products - Obtener productos más vendidos
    this.router.get('/top-products', this.controller.getTopProducts.bind(this.controller));

    // GET /api/reports/export - Exportar reporte en formato CSV
    this.router.get('/export', this.controller.exportReport.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}