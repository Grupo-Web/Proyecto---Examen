/**
 * Product Controller - Interfaces Layer
 * Maneja las peticiones HTTP para productos (MANTENEDOR)
 */

import { Request, Response } from 'express';
import { ProductRepository } from '../../domain/repositories/product.repository.js';
import { Product } from '../../domain/entities/product.entity.js';
import { v4 as uuidv4 } from 'uuid';

export class ProductController {
  constructor(private productRepository: ProductRepository) {}

  // GET /api/products - Listar todos los productos
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.productRepository.findAll();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener productos', 
        message: error.message 
      });
    }
  }

  // GET /api/products/:id - Obtener producto por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productRepository.findById(id);
      
      if (!product) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }

      res.json(product);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener producto', 
        message: error.message 
      });
    }
  }

  // GET /api/products/category/:category - Obtener productos por categoría
  async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const products = await this.productRepository.findByCategory(category);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener productos por categoría', 
        message: error.message 
      });
    }
  }

  // GET /api/products/categories - Obtener categorías únicas
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.productRepository.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener categorías', 
        message: error.message 
      });
    }
  }

  // POST /api/products - Crear nuevo producto
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, price, category, stock } = req.body;

      // Validaciones
      if (!name || !price || !category) {
        res.status(400).json({ 
          error: 'Datos incompletos',
          message: 'Se requieren: name, price, category' 
        });
        return;
      }

      const product = new Product(
        uuidv4(),
        name,
        parseFloat(price),
        category,
        parseInt(stock) || 0
      );

      const saved = await this.productRepository.save(product);
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Error al crear producto', 
        message: error.message 
      });
    }
  }

  // PUT /api/products/:id - Actualizar producto
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, price, category, stock } = req.body;

      // Verificar que existe
      const existing = await this.productRepository.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }

      // Actualizar
      existing.update({
        name: name || existing.name,
        price: price !== undefined ? parseFloat(price) : existing.price,
        category: category || existing.category,
        stock: stock !== undefined ? parseInt(stock) : existing.stock
      });

      const updated = await this.productRepository.update(id, existing);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ 
        error: 'Error al actualizar producto', 
        message: error.message 
      });
    }
  }

  // DELETE /api/products/:id - Eliminar producto
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const exists = await this.productRepository.exists(id);
      if (!exists) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }

      await this.productRepository.delete(id);
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al eliminar producto', 
        message: error.message 
      });
    }
  }
}