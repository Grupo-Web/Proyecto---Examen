/**
 * Report Controller - Interfaces Layer
 * Maneja las peticiones HTTP para reportes y exportación
 */

import { Request, Response } from 'express';
import { GetSalesReportUseCase } from '../../application/get-sales-report.usecase.js';
import { ExportReportUseCase } from '../../application/export-report.usecase.js';

export class ReportController {
  constructor(
    private getSalesReportUseCase: GetSalesReportUseCase,
    private exportReportUseCase: ExportReportUseCase
  ) {}

  // GET /api/reports/sales?period=today|week|month|custom&startDate=...&endDate=...
  async getSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const { period, startDate, endDate } = req.query;

      // Validar período
      const validPeriods = ['today', 'week', 'month', 'custom'];
      if (!period || !validPeriods.includes(period as string)) {
        res.status(400).json({ 
          error: 'Período inválido',
          message: 'period debe ser: today, week, month o custom' 
        });
        return;
      }

      // Validar fechas para período personalizado
      if (period === 'custom') {
        if (!startDate || !endDate) {
          res.status(400).json({ 
            error: 'Fechas requeridas',
            message: 'Para período custom se requieren startDate y endDate' 
          });
          return;
        }
      }

      const report = await this.getSalesReportUseCase.execute({
        period: period as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al generar reporte', 
        message: error.message 
      });
    }
  }

  // GET /api/reports/export?format=json|csv&period=today|week|month|custom&startDate=...&endDate=...
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { format, period, startDate, endDate } = req.query;

      // Validar formato
      const validFormats = ['json', 'csv'];
      if (!format || !validFormats.includes(format as string)) {
        res.status(400).json({ 
          error: 'Formato inválido',
          message: 'format debe ser: json o csv' 
        });
        return;
      }

      // Validar período
      const validPeriods = ['today', 'week', 'month', 'custom'];
      if (!period || !validPeriods.includes(period as string)) {
        res.status(400).json({ 
          error: 'Período inválido',
          message: 'period debe ser: today, week, month o custom' 
        });
        return;
      }

      // Validar fechas para período personalizado
      if (period === 'custom' && (!startDate || !endDate)) {
        res.status(400).json({ 
          error: 'Fechas requeridas',
          message: 'Para período custom se requieren startDate y endDate' 
        });
        return;
      }

      const report = await this.exportReportUseCase.execute({
        format: format as any,
        period: period as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      // Configurar headers para descarga
      res.setHeader('Content-Type', report.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
      res.send(report.content);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al exportar reporte', 
        message: error.message 
      });
    }
  }
}