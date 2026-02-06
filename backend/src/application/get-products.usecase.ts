/**
 * Get Products Use Case - Lógica para obtener el listado de productos
 */

import { ProductRepository, ProductData } from '../domain/repositories/product.repository.js';

export class GetProductsUseCase {
  constructor(
    private productRepository: ProductRepository
  ) {}

  async execute(): Promise<ProductData[]> {
    // Aquí podrías agregar lógica adicional, como filtrar por stock
    // o productos activos, pero para el examen, traer todo es suficiente.
    const products = await this.productRepository.findAll();
    
    return products;
  }
}