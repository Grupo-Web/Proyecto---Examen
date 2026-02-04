/**
 * Sale Repository Implementation - Infrastructure Layer
 * Implementación de persistencia de ventas con SQLite
 */

import { SaleRepository } from '../../domain/repositories/sale.repository.js';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleItem } from '../../domain/entities/sale-item.entity.js';
import { getConnection } from '../database/sqlite/sqlite.connection.js';
import { v4 as uuidv4 } from 'uuid';

export class SQLiteSaleRepository implements SaleRepository {
  
  async save(sale: Sale): Promise<Sale> {
    const db = await getConnection();
    
    const id = sale.id || uuidv4();
    
    // Iniciar transacción
    await db.run('BEGIN TRANSACTION');

    try {
      // Insertar venta
      await db.run(
        `INSERT INTO sales (id, total, date, customer_name) 
         VALUES (?, ?, ?, ?)`,
        [id, sale.total, sale.date.toISOString(), sale.customerName || null]
      );

      // Insertar items de la venta
      for (const item of sale.items) {
        await db.run(
          `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, item.productId, item.productName, item.quantity, item.price, item.subtotal]
        );

        // Actualizar stock del producto
        await db.run(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [item.quantity, item.productId]
        );
      }

      await db.run('COMMIT');

      return await this.findById(id) || sale;
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  }

  async findAll(): Promise<Sale[]> {
    const db = await getConnection();
    const salesRows = await db.all('SELECT * FROM sales ORDER BY date DESC');
    
    const sales: Sale[] = [];
    
    for (const saleRow of salesRows) {
      const itemsRows = await db.all(
        'SELECT * FROM sale_items WHERE sale_id = ?',
        [saleRow.id]
      );

      const items = itemsRows.map(itemRow => new SaleItem(
        itemRow.product_id,
        itemRow.product_name,
        itemRow.quantity,
        itemRow.price
      ));

      sales.push(new Sale(
        saleRow.id,
        items,
        new Date(saleRow.date),
        saleRow.customer_name
      ));
    }

    return sales;
  }

  async findById(id: string): Promise<Sale | null> {
    const db = await getConnection();
    const saleRow = await db.get('SELECT * FROM sales WHERE id = ?', [id]);
    
    if (!saleRow) return null;

    const itemsRows = await db.all(
      'SELECT * FROM sale_items WHERE sale_id = ?',
      [id]
    );

    const items = itemsRows.map(itemRow => new SaleItem(
      itemRow.product_id,
      itemRow.product_name,
      itemRow.quantity,
      itemRow.price
    ));

    return new Sale(
      saleRow.id,
      items,
      new Date(saleRow.date),
      saleRow.customer_name
    );
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    const db = await getConnection();
    const salesRows = await db.all(
      'SELECT * FROM sales WHERE date >= ? AND date <= ? ORDER BY date DESC',
      [startDate.toISOString(), endDate.toISOString()]
    );

    const sales: Sale[] = [];
    
    for (const saleRow of salesRows) {
      const itemsRows = await db.all(
        'SELECT * FROM sale_items WHERE sale_id = ?',
        [saleRow.id]
      );

      const items = itemsRows.map(itemRow => new SaleItem(
        itemRow.product_id,
        itemRow.product_name,
        itemRow.quantity,
        itemRow.price
      ));

      sales.push(new Sale(
        saleRow.id,
        items,
        new Date(saleRow.date),
        saleRow.customer_name
      ));
    }

    return sales;
  }

  async findByToday(): Promise<Sale[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findByDateRange(today, tomorrow);
  }

  async findByWeek(): Promise<Sale[]> {
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 7);

    return this.findByDateRange(firstDayOfWeek, lastDayOfWeek);
  }

  async findByMonth(): Promise<Sale[]> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);

    return this.findByDateRange(firstDayOfMonth, lastDayOfMonth);
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    const db = await getConnection();
    
    let query = 'SELECT SUM(total) as revenue FROM sales';
    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE date >= ? AND date <= ?';
      params.push(startDate.toISOString(), endDate.toISOString());
    }

    const result = await db.get(query, params);
    return result?.revenue || 0;
  }

  async getTopProducts(limit: number): Promise<Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>> {
    const db = await getConnection();
    
    const rows = await db.all(`
      SELECT 
        product_id as productId,
        product_name as productName,
        SUM(quantity) as totalQuantity,
        SUM(subtotal) as totalRevenue
      FROM sale_items
      GROUP BY product_id, product_name
      ORDER BY totalQuantity DESC
      LIMIT ?
    `, [limit]);

    return rows;
  }

  async getStatistics(): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageTicket: number;
    totalProducts: number;
  }> {
    const db = await getConnection();
    
    const salesStats = await db.get(`
      SELECT 
        COUNT(*) as totalSales,
        SUM(total) as totalRevenue,
        AVG(total) as averageTicket
      FROM sales
    `);

    const productsStats = await db.get(`
      SELECT COUNT(DISTINCT product_id) as totalProducts
      FROM sale_items
    `);

    return {
      totalSales: salesStats?.totalSales || 0,
      totalRevenue: salesStats?.totalRevenue || 0,
      averageTicket: salesStats?.averageTicket || 0,
      totalProducts: productsStats?.totalProducts || 0
    };
  }
}