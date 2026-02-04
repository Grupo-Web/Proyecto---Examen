/**
 * Create Sale Use Case - Lógica de negocio para crear una venta
 */

import { SaleRepository, SaleItemData, SaleData } from '../domain/repositories/sale.repository.js';
import { ProductRepository } from '../domain/repositories/product.repository.js';

export interface CreateSaleDTO {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export class CreateSaleUseCase {
  constructor(
    private saleRepository: SaleRepository,
    private productRepository: ProductRepository
  ) {}

  async execute(dto: CreateSaleDTO): Promise<SaleData> {
    // Validar que hay items
    if (!dto.items || dto.items.length === 0) {
      throw new Error('La venta debe tener al menos un producto');
    }

    // Validar y calcular el total
    let total = 0;
    const saleItems: SaleItemData[] = [];

    for (const item of dto.items) {
      // Validar cantidad
      if (item.quantity <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      // Obtener producto
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }

      // Verificar stock
      if (product.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${product.name}. ` +
          `Disponible: ${product.stock}, Solicitado: ${item.quantity}`
        );
      }

      // Calcular subtotal
      const subtotal = product.price * item.quantity;
      total += subtotal;

      // Agregar item
      saleItems.push({
        productId: product.id!,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal
      });
    }

    // Crear la venta
    const sale = await this.saleRepository.save({
      date: new Date(),
      total,
      items: saleItems
    });

    // Actualizar stock de productos
    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        await this.productRepository.update(item.productId, {
          ...product,
          stock: product.stock - item.quantity
        });
      }
    }

    return sale;
  }
}