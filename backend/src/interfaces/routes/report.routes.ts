/**
 * Report Routes - Interfaces Layer
 * Define las rutas para reportes y exportación
 */

import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';

export function createReportRoutes(controller: ReportController): Router {
  const router = Router();

  // Obtener reporte de ventas con análisis
  router.get('/sales', (req, res) => controller.getSalesReport(req, res));

  // Exportar reporte en diferentes formatos
  router.get('/export', (req, res) => controller.exportReport(req, res));

  return router;
}