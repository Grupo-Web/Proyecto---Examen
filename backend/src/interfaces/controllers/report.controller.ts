
import { Request, Response } from 'express';
import { SaleRepository } from '../../domain/repositories/sale.repository.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';

function getStringParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export class ReportController {
  constructor(
    private saleRepository: SaleRepository,
    private productRepository: ProductRepository
  ) {}

  async getSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const startDateParam = getStringParam(req.query.startDate as string | string[] | undefined);
      const endDateParam = getStringParam(req.query.endDate as string | string[] | undefined);

      let sales;
      
      if (startDateParam && endDateParam) {
        const startDate = new Date(startDateParam);
        const endDate = new Date(endDateParam);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          res.status(400).json({ error: 'Fechas inválidas' });
          return;
        }
        
        sales = await this.saleRepository.findByDateRange(startDate, endDate);
      } else {
        sales = await this.saleRepository.findAll();
      }

      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

      res.json({
        totalSales,
        totalRevenue,
        averageTicket,
        sales
      });
    } catch (error) {
      console.error('Error al obtener reporte de ventas:', error);
      res.status(500).json({ 
        error: 'Error al obtener reporte',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getTopProducts(req: Request, res: Response): Promise<void> {
    try {
      const limitParam = getStringParam(req.query.limit as string | string[] | undefined);
      const limit = limitParam ? parseInt(limitParam) : 10;

      if (isNaN(limit) || limit <= 0) {
        res.status(400).json({ error: 'El parámetro limit debe ser un número positivo' });
        return;
      }

      const topProducts = await this.saleRepository.getTopProducts(limit);
      res.json(topProducts);
    } catch (error) {
      console.error('Error al obtener productos más vendidos:', error);
      res.status(500).json({ 
        error: 'Error al obtener productos más vendidos',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const sales = await this.saleRepository.findAll();

      const csvHeader = 'ID,Fecha,Total,Productos\n';
      const csvRows = sales.map(sale => {
        const products = sale.items.map(item => 
          `${item.productName} (x${item.quantity})`
        ).join('; ');
        
        return `${sale.id},${sale.date.toISOString()},${sale.total},"${products}"`;
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=ventas.csv');
      res.send(csv);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      res.status(500).json({ 
        error: 'Error al exportar reporte',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}