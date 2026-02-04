/**
 * Export Report Use Case - Application Layer
 * Caso de uso para exportar reportes en diferentes formatos
 */

import { SaleRepository } from '../domain/repositories/sale.repository.js';
import { Sale } from '../domain/entities/sale.entity.js';

export interface ExportReportDTO {
  format: 'json' | 'csv';
  period: 'today' | 'week' | 'month' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface ExportReportResponse {
  filename: string;
  content: string;
  mimeType: string;
}

export class ExportReportUseCase {
  constructor(private saleRepository: SaleRepository) {}

  async execute(dto: ExportReportDTO): Promise<ExportReportResponse> {
    // Obtener ventas según el período
    let sales: Sale[];

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
          throw new Error('Para período personalizado se requieren fechas');
        }
        sales = await this.saleRepository.findByDateRange(dto.startDate, dto.endDate);
        break;
      default:
        sales = await this.saleRepository.findAll();
    }

    // Generar reporte según formato
    if (dto.format === 'csv') {
      return this.generateCSV(sales, dto.period);
    } else {
      return this.generateJSON(sales, dto.period);
    }
  }

  private generateCSV(sales: Sale[], period: string): ExportReportResponse {
    // Encabezados CSV
    const headers = [
      'ID Venta',
      'Fecha',
      'Cliente',
      'Producto',
      'Cantidad',
      'Precio Unitario',
      'Subtotal',
      'Total Venta'
    ];

    let csvContent = headers.join(',') + '\n';

    // Datos
    for (const sale of sales) {
      for (const item of sale.items) {
        const row = [
          sale.id,
          sale.date.toISOString(),
          sale.customerName || 'N/A',
          `"${item.productName}"`, // Comillas para nombres con comas
          item.quantity,
          item.price.toFixed(2),
          item.subtotal.toFixed(2),
          sale.total.toFixed(2)
        ];
        csvContent += row.join(',') + '\n';
      }
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `reporte_ventas_${period}_${timestamp}.csv`;

    return {
      filename,
      content: csvContent,
      mimeType: 'text/csv'
    };
  }

  private generateJSON(sales: Sale[], period: string): ExportReportResponse {
    const data = {
      generatedAt: new Date().toISOString(),
      period,
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
      sales: sales.map(sale => ({
        id: sale.id,
        date: sale.date.toISOString(),
        customerName: sale.customerName,
        total: sale.total,
        items: sale.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        }))
      }))
    };

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `reporte_ventas_${period}_${timestamp}.json`;

    return {
      filename,
      content: JSON.stringify(data, null, 2),
      mimeType: 'application/json'
    };
  }
}