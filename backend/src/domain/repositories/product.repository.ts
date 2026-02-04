/**
 * Product Repository Interface - Domain Layer
 * Contrato para persistencia de productos
 */

import { Product } from '../entities/product.entity.js';

export interface ProductRepository {
  // Crear un nuevo producto
  save(product: Product): Promise<Product>;

  // Obtener todos los productos
  findAll(): Promise<Product[]>;

  // Buscar producto por ID
  findById(id: string): Promise<Product | null>;

  // Buscar productos por categoría
  findByCategory(category: string): Promise<Product[]>;

  // Actualizar producto
  update(id: string, product: Product): Promise<Product>;

  // Eliminar producto
  delete(id: string): Promise<boolean>;

  // Verificar si existe un producto
  exists(id: string): Promise<boolean>;

  // Obtener categorías únicas
  getCategories(): Promise<string[]>;
}