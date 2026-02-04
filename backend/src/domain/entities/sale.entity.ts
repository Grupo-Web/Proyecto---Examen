/**
 * Sale Entity - Domain Layer
 * Representa una venta en la cafetería
 */

import { SaleItem } from './sale-item.entity.js';

export class Sale {
  public readonly items: SaleItem[];
  public readonly total: number;

  constructor(
    public readonly id: string,
    items: SaleItem[],
    public readonly date: Date = new Date(),
    public customerName?: string
  ) {
    if (!items || items.length === 0) {
      throw new Error('Una venta debe tener al menos un item');
    }

    this.items = items;
    this.total = this.calculateTotal();
  }

  private calculateTotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Obtener cantidad total de items
  getTotalQuantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Obtener items agrupados por producto
  getItemsByProduct(): Map<string, SaleItem> {
    const map = new Map<string, SaleItem>();
    this.items.forEach(item => {
      map.set(item.productId, item);
    });
    return map;
  }

  // Convertir a objeto plano para DB
  toJSON() {
    return {
      id: this.id,
      items: this.items.map(item => item.toJSON()),
      total: this.total,
      date: this.date,
      customerName: this.customerName
    };
  }

  // Crear desde objeto plano
  static fromJSON(data: any): Sale {
    const items = data.items.map((itemData: any) => SaleItem.fromJSON(itemData));
    return new Sale(
      data.id,
      items,
      new Date(data.date),
      data.customerName
    );
  }
}