
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
    this.router.get('/sales', this.controller.getSalesReport.bind(this.controller));

    this.router.get('/top-products', this.controller.getTopProducts.bind(this.controller));

    this.router.get('/export', this.controller.exportReport.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}