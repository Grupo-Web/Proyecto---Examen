/**
 * Product Entity - Domain Layer
 * Representa un producto de la cafetería
 */

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public category: string,
    public stock: number = 0,
    public createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('El nombre del producto es requerido');
    }

    if (this.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    if (this.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    if (!this.category || this.category.trim().length === 0) {
      throw new Error('La categoría es requerida');
    }
  }

  // Método para actualizar el producto
  update(data: Partial<Omit<Product, 'id' | 'createdAt'>>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.price !== undefined) this.price = data.price;
    if (data.category !== undefined) this.category = data.category;
    if (data.stock !== undefined) this.stock = data.stock;
    
    this.validate();
  }

  // Método para reducir stock al vender
  reduceStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }
    
    if (this.stock < quantity) {
      throw new Error(`Stock insuficiente. Disponible: ${this.stock}, Solicitado: ${quantity}`);
    }
    
    this.stock -= quantity;
  }

  // Convertir a objeto plano para DB
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      category: this.category,
      stock: this.stock,
      createdAt: this.createdAt
    };
  }

  // Crear desde objeto plano
  static fromJSON(data: any): Product {
    return new Product(
      data.id,
      data.name,
      data.price,
      data.category,
      data.stock || 0,
      new Date(data.createdAt)
    );
  }
}