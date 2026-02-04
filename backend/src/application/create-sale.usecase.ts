/**
 * Create Sale Use Case - Application Layer
 * Caso de uso para registrar una nueva venta
 */

import { Sale } from '../domain/entities/sale.entity.js';
import { SaleItem } from '../domain/entities/sale-item.entity.js';
import { SaleRepository } from '../domain/repositories/sale.repository.js';
import { ProductRepository } from '../domain/repositories/product.repository.js';
import { NotFoundError, InsufficientStockError } from '../domain/errors/domain.error.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateSaleDTO {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerName?: string;
}

export class CreateSaleUseCase {
  constructor(
    private saleRepository: SaleRepository,
    private productRepository: ProductRepository
  ) {}

  async execute(dto: CreateSaleDTO): Promise<Sale> {
    // Validar que hay items
    if (!dto.items || dto.items.length === 0) {
      throw new Error('Debe agregar al menos un producto a la venta');
    }

    // Crear items de venta con validaciones
    const saleItems: SaleItem[] = [];

    for (const item of dto.items) {
      // Buscar producto
      const product = await this.productRepository.findById(item.productId);
      
      if (!product) {
        throw new NotFoundError('Producto', item.productId);
      }

      // Verificar stock
      if (product.stock < item.quantity) {
        throw new InsufficientStockError(
          product.name,
          product.stock,
          item.quantity
        );
      }

      // Crear item de venta
      const saleItem = new SaleItem(
        product.id,
        product.name,
        item.quantity,
        product.price
      );

      saleItems.push(saleItem);
    }

    // Crear la venta
    const sale = new Sale(
      uuidv4(),
      saleItems,
      new Date(),
      dto.customerName
    );

    // Guardar en el repositorio (esto también actualiza el stock)
    return await this.saleRepository.save(sale);
  }
}