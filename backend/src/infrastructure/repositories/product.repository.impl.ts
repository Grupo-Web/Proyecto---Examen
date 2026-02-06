/**
 * Product Repository Implementation - Infrastructure Layer
 * Implementación de persistencia de productos con SQLite
 */

import { ProductRepository, ProductData } from '../../domain/repositories/product.repository.js';
import { getDatabase } from '../database/sqlite/sqlite.connection.js';
import { v4 as uuidv4 } from 'uuid';

export class ProductRepositoryImpl implements ProductRepository {
  
  async save(product: Omit<ProductData, 'id'>): Promise<ProductData> {
    const db = await getDatabase();
    
    const id = uuidv4();
    const now = new Date().toISOString();
    const productData = {
      id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      created_at: now,
      updated_at: now
    };

    await db.run(
      `INSERT INTO products (id, name, description, price, category, stock, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [productData.id, productData.name, productData.description, productData.price, 
       productData.category, productData.stock, productData.created_at, productData.updated_at]
    );

    return {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      stock: productData.stock,
      createdAt: new Date(productData.created_at)
    };
  }

  async findAll(): Promise<ProductData[]> {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM products ORDER BY created_at DESC');
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: row.price,
      category: row.category,
      stock: row.stock,
      createdAt: new Date(row.created_at)
    }));
  }

  async findById(id: string): Promise<ProductData | null> {
    const db = await getDatabase();
    const row = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: row.price,
      category: row.category,
      stock: row.stock,
      createdAt: new Date(row.created_at)
    };
  }

  async findByCategory(category: string): Promise<ProductData[]> {
    const db = await getDatabase();
    const rows = await db.all(
      'SELECT * FROM products WHERE category = ? ORDER BY name',
      [category]
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      price: row.price,
      category: row.category,
      stock: row.stock,
      createdAt: new Date(row.created_at)
    }));
  }

  async update(id: string, product: Omit<ProductData, 'id'>): Promise<ProductData> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    await db.run(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category = ?, stock = ?, updated_at = ?
       WHERE id = ?`,
      [product.name, product.description, product.price, product.category, product.stock, now, id]
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Producto con ID ${id} no encontrado después de actualizar`);
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.run('DELETE FROM products WHERE id = ?', [id]);
    
    return (result.changes || 0) > 0;
  }
}