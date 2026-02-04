/**
 * Get Sales Report Use Case - Lógica de negocio para obtener reportes de ventas
 */

import { SaleRepository, SaleData, TopProduct } from '../domain/repositories/sale.repository.js';

export interface SalesReportDTO {
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  sales: SaleData[];
  topProducts?: TopProduct[];
}

export interface GetSalesReportQuery {
  startDate?: Date;
  endDate?: Date;
  period?: 'day' | 'week' | 'month' | 'year';
  limit?: number;
}

export class GetSalesReportUseCase {
  constructor(private saleRepository: SaleRepository) {}

  async execute(query: GetSalesReportQuery = {}): Promise<SalesReportDTO> {
    const { startDate, endDate, period, limit = 10 } = query;

    let sales: SaleData[];

    // Determinar rango de fechas según el período
    if (period) {
      const now = new Date();
      let start: Date;

      switch (period) {
        case 'day':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          break;
      }

      sales = await this.saleRepository.findByDateRange(start, now);
    } else if (startDate && endDate) {
      // Usar fechas específicas
      sales = await this.saleRepository.findByDateRange(startDate, endDate);
    } else if (startDate) {
      // Solo fecha de inicio - hasta ahora
      sales = await this.saleRepository.findByDateRange(startDate, new Date());
    } else if (endDate) {
      // Solo fecha de fin - desde hace 30 días
      const start = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      sales = await this.saleRepository.findByDateRange(start, endDate);
    } else {
      // Sin filtros - todas las ventas
      sales = await this.saleRepository.findAll();
    }

    // Calcular estadísticas
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Obtener top productos
    const topProducts = await this.saleRepository.getTopProducts(limit);

    return {
      totalSales,
      totalRevenue,
      averageTicket,
      sales,
      topProducts
    };
  }
}