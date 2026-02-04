/**
 * SaleItem Entity - Domain Layer
 * Representa un item individual dentro de una venta
 */

export class SaleItem {
  public readonly subtotal: number;

  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly price: number
  ) {
    this.validate();
    this.subtotal = this.calculateSubtotal();
  }

  private validate(): void {
    if (!this.productId || this.productId.trim().length === 0) {
      throw new Error('El ID del producto es requerido');
    }

    if (!this.productName || this.productName.trim().length === 0) {
      throw new Error('El nombre del producto es requerido');
    }

    if (this.quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    if (this.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
  }

  private calculateSubtotal(): number {
    return this.quantity * this.price;
  }

  // Convertir a objeto plano para DB
  toJSON() {
    return {
      productId: this.productId,
      productName: this.productName,
      quantity: this.quantity,
      price: this.price,
      subtotal: this.subtotal
    };
  }

  // Crear desde objeto plano
  static fromJSON(data: any): SaleItem {
    return new SaleItem(
      data.productId,
      data.productName,
      data.quantity,
      data.price
    );
  }
}