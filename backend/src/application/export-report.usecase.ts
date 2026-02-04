/**
 * Export Report Use Case - Lógica de negocio para exportar reportes
 */

import { SaleRepository, SaleData } from '../domain/repositories/sale.repository.js';

export interface ExportReportQuery {
  format: 'csv' | 'json';
  startDate?: Date;
  endDate?: Date;
}

export class ExportReportUseCase {
  constructor(private saleRepository: SaleRepository) {}

  async execute(query: ExportReportQuery): Promise<string> {
    const { format, startDate, endDate } = query;

    // Obtener ventas según filtros
    let sales: SaleData[];
    if (startDate && endDate) {
      sales = await this.saleRepository.findByDateRange(startDate, endDate);
    } else {
      sales = await this.saleRepository.findAll();
    }

    // Exportar según formato
    if (format === 'json') {
      return this.exportJSON(sales);
    } else {
      return this.exportCSV(sales);
    }
  }

  private exportJSON(sales: SaleData[]): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
      sales: sales.map(sale => ({
        id: sale.id,
        date: sale.date,
        total: sale.total,
        items: sale.items
      }))
    }, null, 2);
  }

  private exportCSV(sales: SaleData[]): string {
    // Header
    let csv = 'ID,Fecha,Total,Cantidad Items,Productos\n';

    // Filas
    for (const sale of sales) {
      const products = sale.items
        .map(item => `${item.productName} (x${item.quantity})`)
        .join('; ');

      const date = sale.date instanceof Date 
        ? sale.date.toISOString() 
        : new Date(sale.date).toISOString();

      csv += `${sale.id},${date},${sale.total},${sale.items.length},"${products}"\n`;
    }

    return csv;
  }

  async getSummary(startDate?: Date, endDate?: Date): Promise<{
    totalRevenue: number;
    totalSales: number;
    averageTicket: number;
    topProducts: any[];
  }> {
    // Obtener ventas
    let sales: SaleData[];
    if (startDate && endDate) {
      sales = await this.saleRepository.findByDateRange(startDate, endDate);
    } else {
      sales = await this.saleRepository.findAll();
    }

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    const topProducts = await this.saleRepository.getTopProducts(10);

    return {
      totalRevenue,
      totalSales,
      averageTicket,
      topProducts
    };
  }
}