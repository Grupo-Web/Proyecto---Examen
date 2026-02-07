export class SaleItem {
  constructor(
    public id: string,
    public saleId: string,
    public productId: string,
    public productName: string,
    public quantity: number,
    public price: number,
    public subtotal: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    if (this.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    if (this.subtotal <= 0) {
      throw new Error('El subtotal debe ser mayor a 0');
    }

    const calculatedSubtotal = this.quantity * this.price;
    if (Math.abs(calculatedSubtotal - this.subtotal) > 0.01) {
      throw new Error('El subtotal no coincide con cantidad x precio');
    }
  }

  public static calculateSubtotal(quantity: number, price: number): number {
    return quantity * price;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      saleId: this.saleId,
      productId: this.productId,
      productName: this.productName,
      quantity: this.quantity,
      price: this.price,
      subtotal: this.subtotal
    };
  }

  public static fromJSON(data: any): SaleItem {
    return new SaleItem(
      data.id,
      data.saleId || data.sale_id,
      data.productId || data.product_id,
      data.productName || data.product_name,
      data.quantity,
      data.price || data.unit_price,
      data.subtotal
    );
  }
}