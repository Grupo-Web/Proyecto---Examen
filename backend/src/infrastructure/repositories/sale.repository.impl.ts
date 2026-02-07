import { SaleRepository } from '../../domain/repositories/sale.repository.js';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleItem } from '../../domain/entities/sale-item.entity.js';
import { getDatabase } from '../database/sqlite/sqlite.connection.js';
import { v4 as uuidv4 } from 'uuid';

export class SaleRepositoryImpl implements SaleRepository {
  
  async save(saleData: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
    const db = await getDatabase();
    
    const saleId = uuidv4();
    const now = new Date().toISOString();

    // Insertar venta
    await db.run(
      `INSERT INTO sales (id, total, sale_date, created_at) 
       VALUES (?, ?, ?, ?)`,
      [saleId, saleData.total, saleData.date.toISOString(), now]
    );

    // Insertar items de la venta
    for (const item of saleData.items) {
      const itemId = uuidv4();
      await db.run(
        `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [itemId, saleId, item.productId, item.quantity, item.price, item.subtotal]
      );
    }

    const created = await this.findById(saleId);
    if (!created) {
      throw new Error('Error al crear la venta');
    }

    return created;
  }

  async findAll(): Promise<Sale[]> {
    const db = await getDatabase();
    const sales = await db.all('SELECT * FROM sales ORDER BY sale_date DESC');
    
    const result: Sale[] = [];
    for (const saleRow of sales) {
      const items = await this.findItemsBySaleId(saleRow.id);
      result.push(Sale.fromJSON({
        id: saleRow.id,
        total: saleRow.total,
        date: saleRow.sale_date,
        createdAt: saleRow.created_at,
        items: items.map(i => i.toJSON())
      }));
    }

    return result;
  }

  async findById(id: string): Promise<Sale | null> {
    const db = await getDatabase();
    const row = await db.get('SELECT * FROM sales WHERE id = ?', [id]);
    
    if (!row) return null;

    const items = await this.findItemsBySaleId(id);

    return Sale.fromJSON({
      id: row.id,
      total: row.total,
      date: row.sale_date,
      createdAt: row.created_at,
      items: items.map(i => i.toJSON())
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Sale[]> {
    const db = await getDatabase();
    const sales = await db.all(
      'SELECT * FROM sales WHERE sale_date BETWEEN ? AND ? ORDER BY sale_date DESC',
      [startDate.toISOString(), endDate.toISOString()]
    );
    
    const result: Sale[] = [];
    for (const saleRow of sales) {
      const items = await this.findItemsBySaleId(saleRow.id);
      result.push(Sale.fromJSON({
        id: saleRow.id,
        total: saleRow.total,
        date: saleRow.sale_date,
        createdAt: saleRow.created_at,
        items: items.map(i => i.toJSON())
      }));
    }

    return result;
  }

  async getTotalSales(startDate?: Date, endDate?: Date): Promise<number> {
    const db = await getDatabase();
    
    let query = 'SELECT COALESCE(SUM(total), 0) as total FROM sales';
    const params: string[] = [];

    if (startDate && endDate) {
      query += ' WHERE sale_date BETWEEN ? AND ?';
      params.push(startDate.toISOString(), endDate.toISOString());
    } else if (startDate) {
      query += ' WHERE sale_date >= ?';
      params.push(startDate.toISOString());
    } else if (endDate) {
      query += ' WHERE sale_date <= ?';
      params.push(endDate.toISOString());
    }

    const result = await db.get(query, params);
    return result?.total || 0;
  }

  async getTopProducts(limit: number = 10, startDate?: Date, endDate?: Date): Promise<Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>> {
    const db = await getDatabase();
    
    let query = `
      SELECT 
        si.product_id as productId,
        p.name as productName,
        SUM(si.quantity) as totalQuantity,
        SUM(si.subtotal) as totalRevenue
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN products p ON si.product_id = p.id
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE s.sale_date BETWEEN ? AND ?';
      params.push(startDate.toISOString(), endDate.toISOString());
    } else if (startDate) {
      query += ' WHERE s.sale_date >= ?';
      params.push(startDate.toISOString());
    } else if (endDate) {
      query += ' WHERE s.sale_date <= ?';
      params.push(endDate.toISOString());
    }

    query += `
      GROUP BY si.product_id, p.name
      ORDER BY totalQuantity DESC
      LIMIT ?
    `;
    params.push(limit);

    const rows = await db.all(query, params);
    return rows.map(row => ({
      productId: row.productId,
      productName: row.productName,
      totalQuantity: row.totalQuantity,
      totalRevenue: row.totalRevenue
    }));
  }

  private async findItemsBySaleId(saleId: string): Promise<SaleItem[]> {
    const db = await getDatabase();
    const items = await db.all(
      `SELECT si.*, p.name as product_name 
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = ?`,
      [saleId]
    );

    return items.map(item => SaleItem.fromJSON({
      id: item.id,
      saleId: item.sale_id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      subtotal: item.subtotal
    }));
  }
}