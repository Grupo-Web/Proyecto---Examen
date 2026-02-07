import { ProductRepository } from '../domain/repositories/product.repository.js';

export class DeleteProductUseCase {
  constructor(
    private productRepository: ProductRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Se requiere el ID del producto para eliminarlo');
    }

    const productExists = await this.productRepository.findById(id);
    if (!productExists) {
      throw new Error(`No se puede eliminar: Producto con ID ${id} no encontrado`);
    }

    return await this.productRepository.delete(id);
  }
}