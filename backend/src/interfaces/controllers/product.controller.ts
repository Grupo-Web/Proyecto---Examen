/**
 * Product Controller - Maneja las peticiones HTTP relacionadas con productos
 */

import { Request, Response } from 'express';
import { ProductRepository } from '../../domain/repositories/product.repository.js';

/**
 * Helper para obtener string de req.params
 */
function getStringParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class ProductController {
  constructor(private productRepository: ProductRepository) {}

  /**
   * GET /api/products - Obtener todos los productos
   */
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productRepository.findAll();
      res.json(products);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ 
        error: 'Error al obtener productos',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * GET /api/products/:id - Obtener producto por ID
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const product = await this.productRepository.findById(id);

      if (!product) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }

      res.json(product);
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.status(500).json({ 
        error: 'Error al obtener producto',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * POST /api/products - Crear nuevo producto
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, category, stock } = req.body;

      // Validaciones básicas
      if (!name || !price || !category) {
        res.status(400).json({ 
          error: 'Campos requeridos: name, price, category' 
        });
        return;
      }

      if (price <= 0) {
        res.status(400).json({ 
          error: 'El precio debe ser mayor a 0' 
        });
        return;
      }

      if (stock !== undefined && stock < 0) {
        res.status(400).json({ 
          error: 'El stock no puede ser negativo' 
        });
        return;
      }

      const productData = {
        name,
        description: description || '',
        price: Number(price),
        category,
        stock: stock !== undefined ? Number(stock) : 0,
        createdAt: new Date()
      };

      const product = await this.productRepository.save(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({ 
        error: 'Error al crear producto',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * PUT /api/products/:id - Actualizar producto
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const { name, description, price, category, stock } = req.body;

      // Verificar que el producto existe
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }

      // Validaciones
      if (price !== undefined && price <= 0) {
        res.status(400).json({ 
          error: 'El precio debe ser mayor a 0' 
        });
        return;
      }

      if (stock !== undefined && stock < 0) {
        res.status(400).json({ 
          error: 'El stock no puede ser negativo' 
        });
        return;
      }

      // Crear objeto con datos actualizados
      const updatedData = {
        name: name !== undefined ? name : existingProduct.name,
        description: description !== undefined ? description : existingProduct.description,
        price: price !== undefined ? Number(price) : existingProduct.price,
        category: category !== undefined ? category : existingProduct.category,
        stock: stock !== undefined ? Number(stock) : existingProduct.stock,
        createdAt: existingProduct.createdAt
      };

      const product = await this.productRepository.update(id, updatedData);
      res.json(product);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ 
        error: 'Error al actualizar producto',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * DELETE /api/products/:id - Eliminar producto
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const deleted = await this.productRepository.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }

      res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({ 
        error: 'Error al eliminar producto',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * GET /api/products/category/:category - Obtener productos por categoría
   */
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = getStringParam(req.params.category);
      const products = await this.productRepository.findByCategory(category);
      res.json(products);
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      res.status(500).json({ 
        error: 'Error al obtener productos',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}