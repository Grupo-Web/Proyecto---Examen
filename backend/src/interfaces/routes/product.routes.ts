/**
 * Product Routes - Define las rutas para el mantenedor de productos
 */

//--------separador--------//
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';


// 1. Importamos la implementación real del repositorio
import { ProductRepositoryImpl } from '../../infrastructure/repositories/product.repository.impl.js';

// 2. Importamos los Casos de Uso que creamos
import { CreateProductUseCase } from '../../application/create-product.usecase.js';
import { GetProductsUseCase } from '../../application/get-products.usecase.js';
import { DeleteProductUseCase } from '../../application/delete-product.usecase.js';

export class ProductRoutes {
  private router: Router;
  private controller: ProductController;

  constructor() {
    this.router = Router();

    // --------------------------------------------------
    // CONEXIÓN DE DEPENDENCIAS (Wiring)
    // --------------------------------------------------
    
    // A. Creamos el Repositorio (Capa Infraestructura)
    const repository = new ProductRepositoryImpl();

    // B. Creamos los Casos de Uso (Capa Aplicación)
    const createProductUC = new CreateProductUseCase(repository);
    const getProductsUC = new GetProductsUseCase(repository);
    const deleteProductUC = new DeleteProductUseCase(repository);

    // C. Creamos el Controlador inyectando todo (Capa Interfaz)
    // Nota: El orden debe coincidir con el constructor de tu ProductController
    this.controller = new ProductController(
      createProductUC,
      getProductsUC,
      deleteProductUC,
      repository // Para los métodos update/getById que aún usan repo directo
    );

    // D. Iniciamos las rutas
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // GET /api/products - Obtener todos (Usa GetProductsUseCase)
    this.router.get('/', this.controller.getAllProducts.bind(this.controller));

    // POST /api/products - Crear nuevo (Usa CreateProductUseCase)
    this.router.post('/', this.controller.createProduct.bind(this.controller));

    // DELETE /api/products/:id - Eliminar (Usa DeleteProductUseCase)
    this.router.delete('/:id', this.controller.deleteProduct.bind(this.controller));

    // --- Rutas que mantienen lógica mixta (sin caso de uso exclusivo aún) ---
    
    // GET /api/products/:id
    this.router.get('/:id', this.controller.getProductById.bind(this.controller));

    // PUT /api/products/:id
    this.router.put('/:id', this.controller.updateProduct.bind(this.controller));

    // GET /api/products/category/:category
    this.router.get('/category/:category', this.controller.getProductsByCategory.bind(this.controller));
  }

  public getRouter(): Router {
    return this.router;
  }
}



