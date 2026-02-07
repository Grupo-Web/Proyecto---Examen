
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
    this.router.get('/', this.controller.getAllSales.bind(this.controller));

    this.router.get('/:id', this.controller.getSaleById.bind(this.controller));

    this.router.post('/', this.controller.createSale.bind(this.controller));

    this.router.get('/date-range', this.controller.getSalesByDateRange.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}