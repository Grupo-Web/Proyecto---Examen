
import { ProductRepository, ProductData } from '../domain/repositories/product.repository.js';

export class GetProductsUseCase {
  constructor(
    private productRepository: ProductRepository
  ) {}

  async execute(): Promise<ProductData[]> {
    const products = await this.productRepository.findAll();
    
    return products;
  }
}