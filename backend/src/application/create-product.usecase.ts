import { ProductRepository, ProductData } from '../domain/repositories/product.repository.js';

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

export class CreateProductUseCase {
  constructor(
    private productRepository: ProductRepository
  ) {}

  async execute(dto: CreateProductDTO): Promise<ProductData> {
    if (!dto.name) {
      throw new Error('El nombre del producto es obligatorio');
    }

    if (dto.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    if (dto.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    if (!dto.category) {
      throw new Error('La categoría es obligatoria');
    }

    const newProduct: Omit<ProductData, 'id'> = {
      name: dto.name,
      description: dto.description || '', 
      price: Number(dto.price),         
      category: dto.category,
      stock: Number(dto.stock),           
      createdAt: new Date()              
    };

    return await this.productRepository.save(newProduct);
  }
}