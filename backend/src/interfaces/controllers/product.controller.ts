
import { Request, Response } from 'express';

import { CreateProductUseCase } from '../../application/create-product.usecase.js';
import { GetProductsUseCase } from '../../application/get-products.usecase.js';
import { DeleteProductUseCase } from '../../application/delete-product.usecase.js';

import { ProductRepository } from '../../domain/repositories/product.repository.js';

function getStringParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class ProductController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private getProductsUseCase: GetProductsUseCase,
    private deleteProductUseCase: DeleteProductUseCase,
    private productRepository: ProductRepository 
  ) {}


  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await this.getProductsUseCase.execute();
      res.json(products);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({ 
        error: 'Error al obtener productos',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const product = await this.createProductUseCase.execute(req.body);
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(400).json({ 
        error: 'No se pudo crear el producto',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      
      await this.deleteProductUseCase.execute(id);

      res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(400).json({ 
        error: 'Error al eliminar',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

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
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }


  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      if (req.body.price !== undefined && req.body.price <= 0) {
         res.status(400).json({ error: 'El precio debe ser positivo' });
         return;
      }

      const updatedProduct = await this.productRepository.update(id, req.body);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({ 
        error: 'Error al actualizar',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = getStringParam(req.params.category);
      const products = await this.productRepository.findByCategory(category);
      res.json(products);
    } catch (error) {
      console.error('Error al filtrar productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}