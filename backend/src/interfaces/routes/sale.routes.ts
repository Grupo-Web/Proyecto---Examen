/**
 * Sale Routes - Interfaces Layer
 * Define las rutas para el PROCESO de ventas
 */

import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller.js';

export function createSaleRoutes(controller: SaleController): Router {
  const router = Router();

  // Estadísticas y análisis
  router.get('/statistics', (req, res) => controller.getStatistics(req, res));
  router.get('/top-products', (req, res) => controller.getTopProducts(req, res));

  // Ventas por período
  router.get('/period/today', (req, res) => controller.getToday(req, res));
  router.get('/period/week', (req, res) => controller.getWeek(req, res));
  router.get('/period/month', (req, res) => controller.getMonth(req, res));

  // CRUD de ventas
  router.get('/', (req, res) => controller.getAll(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.post('/', (req, res) => controller.create(req, res));

  return router;
}