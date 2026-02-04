/**
 * Product Routes - Define las rutas para el mantenedor de productos
 */

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';

export class ProductRoutes {
  private router: Router;
  private controller: ProductController;

  constructor(controller: ProductController) {
    this.router = Router();
    this.controller = controller;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /api/products - Obtener todos los productos
    this.router.get('/', this.controller.getAllProducts.bind(this.controller));

    // GET /api/products/:id - Obtener producto por ID
    this.router.get('/:id', this.controller.getProductById.bind(this.controller));

    // POST /api/products - Crear nuevo producto
    this.router.post('/', this.controller.createProduct.bind(this.controller));

    // PUT /api/products/:id - Actualizar producto
    this.router.put('/:id', this.controller.updateProduct.bind(this.controller));

    // DELETE /api/products/:id - Eliminar producto
    this.router.delete('/:id', this.controller.deleteProduct.bind(this.controller));

    // GET /api/products/category/:category - Obtener productos por categoría
    this.router.get('/category/:category', this.controller.getProductsByCategory.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}