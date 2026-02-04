/**
 * Product Routes - Interfaces Layer
 * Define las rutas para el MANTENEDOR de productos
 */

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';

export function createProductRoutes(controller: ProductController): Router {
  const router = Router();

  // Obtener todas las categorías
  router.get('/categories', (req, res) => controller.getCategories(req, res));

  // Obtener productos por categoría
  router.get('/category/:category', (req, res) => controller.getByCategory(req, res));

  // CRUD de productos
  router.get('/', (req, res) => controller.getAll(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.post('/', (req, res) => controller.create(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}
