/**
 * Sale Repository Interface - Domain Layer
 * Contrato para persistencia de ventas
 */

import { Sale } from '../entities/sale.entity.js';

export interface SaleRepository {
  // Guardar una nueva venta
  save(sale: Sale): Promise<Sale>;

  // Obtener todas las ventas
  findAll(): Promise<Sale[]>;

  // Buscar venta por ID
  findById(id: string): Promise<Sale | null>;

  // Buscar ventas por rango de fechas
  findByDateRange(startDate: Date, endDate: Date): Promise<Sale[]>;

  // Obtener ventas del día
  findByToday(): Promise<Sale[]>;

  // Obtener ventas de la semana
  findByWeek(): Promise<Sale[]>;

  // Obtener ventas del mes
  findByMonth(): Promise<Sale[]>;

  // Calcular ingresos totales en un rango
  getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number>;

  // Obtener productos más vendidos
  getTopProducts(limit: number): Promise<Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>>;

  // Obtener estadísticas de ventas
  getStatistics(): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageTicket: number;
    totalProducts: number;
  }>;
}