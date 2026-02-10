export interface SaleItemData {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface SaleData {
  id: string;
  date: Date;
  total: number;
  items: SaleItemData[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface SaleRepository {
  save(sale: { date: Date; total: number; items: SaleItemData[] }): Promise<SaleData>;
  findAll(): Promise<SaleData[]>;
  findById(id: string): Promise<SaleData | null>;
  findByDateRange(startDate: Date, endDate: Date): Promise<SaleData[]>;
  getTopProducts(limit: number): Promise<TopProduct[]>;
}