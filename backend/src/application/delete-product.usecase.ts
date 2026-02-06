/**
 * Delete Product Use Case - Lógica para eliminar un producto del sistema
 */

import { ProductRepository } from '../domain/repositories/product.repository.js';

export class DeleteProductUseCase {
  constructor(
    private productRepository: ProductRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    // 1. Validar que el ID no venga vacío
    if (!id) {
      throw new Error('Se requiere el ID del producto para eliminarlo');
    }

    // 2. Verificar si el producto existe antes de intentar borrarlo
    const productExists = await this.productRepository.findById(id);
    if (!productExists) {
      throw new Error(`No se puede eliminar: Producto con ID ${id} no encontrado`);
    }

    // 3. Ejecutar la eliminación a través del repositorio
    return await this.productRepository.delete(id);
  }
}