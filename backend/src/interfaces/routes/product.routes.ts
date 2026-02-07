import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';


import { ProductRepositoryImpl } from '../../infrastructure/repositories/product.repository.impl.js';

import { CreateProductUseCase } from '../../application/create-product.usecase.js';
import { GetProductsUseCase } from '../../application/get-products.usecase.js';
import { DeleteProductUseCase } from '../../application/delete-product.usecase.js';

export class ProductRoutes {
  private router: Router;
  private controller: ProductController;

  constructor() {
    this.router = Router();

    const repository = new ProductRepositoryImpl();

    const createProductUC = new CreateProductUseCase(repository);
    const getProductsUC = new GetProductsUseCase(repository);
    const deleteProductUC = new DeleteProductUseCase(repository);

    this.controller = new ProductController(
      createProductUC,
      getProductsUC,
      deleteProductUC,
      repository 
    );

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.controller.getAllProducts.bind(this.controller));

    this.router.post('/', this.controller.createProduct.bind(this.controller));

    this.router.delete('/:id', this.controller.deleteProduct.bind(this.controller));

    this.router.get('/:id', this.controller.getProductById.bind(this.controller));

    this.router.put('/:id', this.controller.updateProduct.bind(this.controller));

    this.router.get('/category/:category', this.controller.getProductsByCategory.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}



