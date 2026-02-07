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
      sales = await this.saleRepository.findByDateRange(startDate, endDate);
    } else if (startDate) {
      sales = await this.saleRepository.findByDateRange(startDate, new Date());
    } else if (endDate) {
      const start = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      sales = await this.saleRepository.findByDateRange(start, endDate);
    } else {
      sales = await this.saleRepository.findAll();
    }

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

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