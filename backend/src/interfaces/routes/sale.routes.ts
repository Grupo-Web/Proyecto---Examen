/**
 * Sale Routes - Define las rutas para el proceso de ventas
 */

import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller.js';

export class SaleRoutes {
  private router: Router;
  private controller: SaleController;

  constructor(controller: SaleController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /api/sales - Obtener todas las ventas
    this.router.get('/', this.controller.getAllSales.bind(this.controller));

    // GET /api/sales/:id - Obtener venta por ID
    this.router.get('/:id', this.controller.getSaleById.bind(this.controller));

    // POST /api/sales - Registrar nueva venta
    this.router.post('/', this.controller.createSale.bind(this.controller));

    // GET /api/sales/date-range - Obtener ventas por rango de fechas
    this.router.get('/date-range', this.controller.getSalesByDateRange.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}