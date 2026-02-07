import { Request, Response } from 'express';
import { SaleRepository } from '../../domain/repositories/sale.repository.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';

function getStringParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

export class SaleController {
  constructor(
    private saleRepository: SaleRepository,
    private productRepository: ProductRepository
  ) {}

  async getAllSales(req: Request, res: Response): Promise<void> {
    try {
      const sales = await this.saleRepository.findAll();
      res.json(sales);
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({ 
        error: 'Error al obtener ventas',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getSaleById(req: Request, res: Response): Promise<void> {
    try {
      const id = getStringParam(req.params.id);
      const sale = await this.saleRepository.findById(id);

      if (!sale) {
        res.status(404).json({ error: 'Venta no encontrada' });
        return;
      }

      res.json(sale);
    } catch (error) {
      console.error('Error al obtener venta:', error);
      res.status(500).json({ 
        error: 'Error al obtener venta',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async createSale(req: Request, res: Response): Promise<void> {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ 
          error: 'Se requiere al menos un producto en la venta' 
        });
        return;
      }

      let total = 0;
      const validatedItems = [];

      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          res.status(400).json({ 
            error: 'Cada item debe tener productId y quantity válidos' 
          });
          return;
        }

        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          res.status(404).json({ 
            error: `Producto con ID ${item.productId} no encontrado` 
          });
          return;
        }

        if (product.stock < item.quantity) {
          res.status(400).json({ 
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}` 
          });
          return;
        }

        const subtotal = product.price * item.quantity;
        total += subtotal;

        validatedItems.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
          subtotal
        });
      }

      const sale = await this.saleRepository.save({
        date: new Date(),
        total,
        items: validatedItems
      });

      for (const item of items) {
        const product = await this.productRepository.findById(item.productId);
        if (product) {
          await this.productRepository.update(item.productId, {
            ...product,
            stock: product.stock - item.quantity
          });
        }
      }

      res.status(201).json(sale);
    } catch (error) {
      console.error('Error al crear venta:', error);
      res.status(500).json({ 
        error: 'Error al crear venta',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getSalesByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ 
          error: 'Se requieren startDate y endDate' 
        });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Fechas inválidas' 
        });
        return;
      }

      const sales = await this.saleRepository.findByDateRange(start, end);
      res.json(sales);
    } catch (error) {
      console.error('Error al obtener ventas por fecha:', error);
      res.status(500).json({ 
        error: 'Error al obtener ventas',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}