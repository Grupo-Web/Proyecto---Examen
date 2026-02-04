/**
 * Get Sales Report Use Case - Application Layer
 * Caso de uso para obtener reportes y análisis de ventas
 */

import { SaleRepository } from '../domain/repositories/sale.repository.js';
import { Sale } from '../domain/entities/sale.entity.js';

export interface SalesReportDTO {
  period: 'today' | 'week' | 'month' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface SalesReportResponse {
  sales: Sale[];
  statistics: {
    totalSales: number;
    totalRevenue: number;
    averageTicket: number;
    totalProducts: number;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  salesByDate: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

export class GetSalesReportUseCase {
  constructor(private saleRepository: SaleRepository) {}

  async execute(dto: SalesReportDTO): Promise<SalesReportResponse> {
    let sales: Sale[];

    // Obtener ventas según el período
    switch (dto.period) {
      case 'today':
        sales = await this.saleRepository.findByToday();
        break;
      case 'week':
        sales = await this.saleRepository.findByWeek();
        break;
      case 'month':
        sales = await this.saleRepository.findByMonth();
        break;
      case 'custom':
        if (!dto.startDate || !dto.endDate) {
          throw new Error('Para período personalizado se requieren fechas de inicio y fin');
        }
        sales = await this.saleRepository.findByDateRange(dto.startDate, dto.endDate);
        break;
      default:
        sales = await this.saleRepository.findAll();
    }

    // Obtener estadísticas generales
    const statistics = await this.saleRepository.getStatistics();

    // Obtener top productos
    const topProducts = await this.saleRepository.getTopProducts(10);

    // Agrupar ventas por fecha
    const salesByDate = this.groupSalesByDate(sales);

    // Agrupar ventas por categoría
    const salesByCategory = this.groupSalesByCategory(sales);

    return {
      sales,
      statistics,
      topProducts,
      salesByDate,
      salesByCategory
    };
  }

  private groupSalesByDate(sales: Sale[]): Array<{
    date: string;
    count: number;
    revenue: number;
  }> {
    const grouped = new Map<string, { count: number; revenue: number }>();

    for (const sale of sales) {
      const dateKey = sale.date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, { count: 0, revenue: 0 });
      }

      const current = grouped.get(dateKey)!;
      current.count++;
      current.revenue += sale.total;
    }

    return Array.from(grouped.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private groupSalesByCategory(sales: Sale[]): Array<{
    category: string;
    count: number;
    revenue: number;
  }> {
    const grouped = new Map<string, { count: number; revenue: number }>();

    for (const sale of sales) {
      for (const item of sale.items) {
        // Asumimos que el nombre del producto contiene la categoría
        // En una implementación real, deberías obtener la categoría del producto
        const category = 'General'; // Por ahora usamos una categoría por defecto

        if (!grouped.has(category)) {
          grouped.set(category, { count: 0, revenue: 0 });
        }

        const current = grouped.get(category)!;
        current.count += item.quantity;
        current.revenue += item.subtotal;
      }
    }

    return Array.from(grouped.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }
}