import { SaleItem } from './sale-item.entity.js';

export class Sale {
  constructor(
    public id: string,
    public items: SaleItem[],
    public total: number,
    public date: Date,
    public createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.items || this.items.length === 0) {
      throw new Error('La venta debe tener al menos un producto');
    }

    if (this.total <= 0) {
      throw new Error('El total de la venta debe ser mayor a 0');
    }

    const calculatedTotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    if (Math.abs(calculatedTotal - this.total) > 0.01) {
      throw new Error('El total de la venta no coincide con la suma de los items');
    }
  }

  public static calculateTotal(items: SaleItem[]): number {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      items: this.items.map(item => item.toJSON()),
      total: this.total,
      date: this.date.toISOString(),
      createdAt: this.createdAt.toISOString()
    };
  }

  public static fromJSON(data: any): Sale {
    const items = data.items.map((itemData: any) => SaleItem.fromJSON(itemData));
    
    return new Sale(
      data.id,
      items,
      data.total,
      new Date(data.date || data.sale_date),
      new Date(data.createdAt || data.created_at)
    );
  }
}