
export interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  createdAt: Date;
}

export interface ProductRepository {
  save(product: Omit<ProductData, 'id'>): Promise<ProductData>;
  findAll(): Promise<ProductData[]>;
  findById(id: string): Promise<ProductData | null>;
  findByCategory(category: string): Promise<ProductData[]>;
  update(id: string, product: Omit<ProductData, 'id'>): Promise<ProductData>;
  delete(id: string): Promise<boolean>;
}