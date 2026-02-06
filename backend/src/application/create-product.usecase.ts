import { ProductRepository, ProductData } from '../domain/repositories/product.repository.js';

// DTO: Definimos qué datos esperamos recibir para crear un producto
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
    // 1. Validaciones de Negocio
    // Regla: El nombre no puede estar vacío
    if (!dto.name) {
      throw new Error('El nombre del producto es obligatorio');
    }

    // Regla: El precio debe ser positivo
    if (dto.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    // Regla: El stock no puede ser negativo
    if (dto.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    // Regla: La categoría es obligatoria
    if (!dto.category) {
      throw new Error('La categoría es obligatoria');
    }

    // 2. Preparar el objeto para guardar
    // Usamos Omit<ProductData, 'id'> porque la base de datos generará el ID
    const newProduct: Omit<ProductData, 'id'> = {
      name: dto.name,
      description: dto.description || '', // Si no viene descripción, guardamos un string vacío
      price: Number(dto.price),           // Aseguramos que sea número
      category: dto.category,
      stock: Number(dto.stock),           // Aseguramos que sea número
      createdAt: new Date()            // Generamos la fecha actual
    };

    // 3. Guardar en la base de datos usando el repositorio
    return await this.productRepository.save(newProduct);
  }
}