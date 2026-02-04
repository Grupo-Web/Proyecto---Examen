/**
 * Sale Controller - Interfaces Layer
 * Maneja las peticiones HTTP para ventas (PROCESO)
 */

import { Request, Response } from 'express';
import { CreateSaleUseCase } from '../../application/create-sale.usecase.js';
import { SaleRepository } from '../../domain/repositories/sale.repository.js';

export class SaleController {
  constructor(
    private createSaleUseCase: CreateSaleUseCase,
    private saleRepository: SaleRepository
  ) {}

  // POST /api/sales - Registrar nueva venta
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { items, customerName } = req.body;

      // Validaciones
      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ 
          error: 'Datos inválidos',
          message: 'Se requiere un array de items con al menos un producto' 
        });
        return;
      }

      // Validar formato de items
      for (const item of items) {
        if (!item.productId || !item.quantity) {
          res.status(400).json({ 
            error: 'Formato de items inválido',
            message: 'Cada item debe tener productId y quantity' 
          });
          return;
        }
      }

      const sale = await this.createSaleUseCase.execute({
        items,
        customerName
      });

      res.status(201).json(sale);
    } catch (error: any) {
      // Manejar errores específicos
      if (error.name === 'NotFoundError') {
        res.status(404).json({ 
          error: 'Producto no encontrado', 
          message: error.message 
        });
        return;
      }

      if (error.name === 'InsufficientStockError') {
        res.status(400).json({ 
          error: 'Stock insuficiente', 
          message: error.message 
        });
        return;
      }

      res.status(500).json({ 
        error: 'Error al registrar venta', 
        message: error.message 
      });
    }
  }

  // GET /api/sales - Listar todas las ventas
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const sales = await this.saleRepository.findAll();
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener ventas', 
        message: error.message 
      });
    }
  }

  // GET /api/sales/:id - Obtener venta por ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sale = await this.saleRepository.findById(id);
      
      if (!sale) {
        res.status(404).json({ error: 'Venta no encontrada' });
        return;
      }

      res.json(sale);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener venta', 
        message: error.message 
      });
    }
  }

  // GET /api/sales/period/today - Ventas del día
  async getToday(req: Request, res: Response): Promise<void> {
    try {
      const sales = await this.saleRepository.findByToday();
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener ventas del día', 
        message: error.message 
      });
    }
  }

  // GET /api/sales/period/week - Ventas de la semana
  async getWeek(req: Request, res: Response): Promise<void> {
    try {
      const sales = await this.saleRepository.findByWeek();
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener ventas de la semana', 
        message: error.message 
      });
    }
  }

  // GET /api/sales/period/month - Ventas del mes
  async getMonth(req: Request, res: Response): Promise<void> {
    try {
      const sales = await this.saleRepository.findByMonth();
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener ventas del mes', 
        message: error.message 
      });
    }
  }

  // GET /api/sales/statistics - Estadísticas generales
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await this.saleRepository.getStatistics();
      res.json(statistics);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener estadísticas', 
        message: error.message 
      });
    }
  }

  // GET /api/sales/top-products?limit=10 - Productos más vendidos
  async getTopProducts(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topProducts = await this.saleRepository.getTopProducts(limit);
      res.json(topProducts);
    } catch (error: any) {
      res.status(500).json({ 
        error: 'Error al obtener top productos', 
        message: error.message 
      });
    }
  }
}