/**
 * Product Repository Implementation - Infrastructure Layer
 * Implementación de persistencia de productos con SQLite
 */

import { ProductRepository } from '../../domain/repositories/product.repository.js';
import { Product } from '../../domain/entities/product.entity.js';
import { getConnection } from '../database/sqlite/sqlite.connection.js';
import { v4 as uuidv4 } from 'uuid';

export class SQLiteProductRepository implements ProductRepository {
  
  async save(product: Product): Promise<Product> {
    const db = await getConnection();
    
    const id = product.id || uuidv4();
    const productData = {
      id,
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      created_at: product.createdAt.toISOString()
    };

    await db.run(
      `INSERT INTO products (id, name, price, category, stock, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productData.id, productData.name, productData.price, 
       productData.category, productData.stock, productData.created_at]
    );

    return Product.fromJSON(productData);
  }

  async findAll(): Promise<Product[]> {
    const db = await getConnection();
    const rows = await db.all('SELECT * FROM products ORDER BY created_at DESC');
    
    return rows.map(row => Product.fromJSON({
      id: row.id,
      name: row.name,
      price: row.price,
      category: row.category,
      stock: row.stock,
      createdAt: row.created_at
    }));
  }

  async findById(id: string): Promise<Product | null> {
    const db = await getConnection();
    const row = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    
    if (!row) return null;

    return Product.fromJSON({
      id: row.id,
      name: row.name,
      price: row.price,
      category: row.category,
      stock: row.stock,
      createdAt: row.created_at
    });
  }

  async findByCategory(category: string): Promise<Product[]> {
    const db = await getConnection();
    const rows = await db.all(
      'SELECT * FROM products WHERE category = ? ORDER BY name',
      [category]
    );
    
    return rows.map(row => Product.fromJSON({
      id: row.id,
      name: row.name,
      price: row.price,
      category: row.category,
      stock: row.stock,
      createdAt: row.created_at
    }));
  }

  async update(id: string, product: Product): Promise<Product> {
    const db = await getConnection();
    
    await db.run(
      `UPDATE products 
       SET name = ?, price = ?, category = ?, stock = ?
       WHERE id = ?`,
      [product.name, product.price, product.category, product.stock, id]
    );

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Producto con ID ${id} no encontrado después de actualizar`);
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getConnection();
    const result = await db.run('DELETE FROM products WHERE id = ?', [id]);
    
    return (result.changes || 0) > 0;
  }

  async exists(id: string): Promise<boolean> {
    const db = await getConnection();
    const row = await db.get('SELECT 1 FROM products WHERE id = ? LIMIT 1', [id]);
    
    return !!row;
  }

  async getCategories(): Promise<string[]> {
    const db = await getConnection();
    const rows = await db.all('SELECT DISTINCT category FROM products ORDER BY category');
    
    return rows.map(row => row.category);
  }
}