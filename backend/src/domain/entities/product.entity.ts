/**
 * Product Entity - Domain Layer
 * Entidad de dominio para productos de la cafetería
 */

export class Product {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public price: number,
    public stock: number,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    this.validate();
  }

  /**
   * Valida los datos del producto
   */
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
  }

  /**
   * Reduce el stock del producto
   */
  public reduceStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    if (this.stock < quantity) {
      throw new Error(`Stock insuficiente. Disponible: ${this.stock}, Requerido: ${quantity}`);
    }

    this.stock -= quantity;
    this.updatedAt = new Date();
  }

  /**
   * Aumenta el stock del producto
   */
  public increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    this.stock += quantity;
    this.updatedAt = new Date();
  }

  /**
   * Actualiza los datos del producto
   */
  public update(data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.price !== undefined) this.price = data.price;
    if (data.stock !== undefined) this.stock = data.stock;
    
    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Convierte el producto a JSON
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * Crea un producto desde JSON
   */
  public static fromJSON(data: any): Product {
    return new Product(
      data.id,
      data.name,
      data.description || '',
      data.price,
      data.stock,
      new Date(data.createdAt || data.created_at),
      new Date(data.updatedAt || data.updated_at)
    );
  }
}