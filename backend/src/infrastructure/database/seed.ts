/**
 * Seed Script - Infrastructure Layer
 * Script para poblar la base de datos con productos de ejemplo
 */

import { Product } from '../../domain/entities/product.entity.js';
import { ProductRepositoryImpl } from '../repositories/product.repository.impl.js';
import { getDatabase, clearDatabase } from './sqlite/sqlite.connection.js';

const productRepository = new ProductRepositoryImpl();

// Productos de ejemplo para una cafetería
const sampleProducts = [
  { name: 'Café Americano', price: 2.50, description: 'Café negro tradicional', stock: 100 },
  { name: 'Café Latte', price: 3.50, description: 'Café con leche espumosa', stock: 100 },
  { name: 'Cappuccino', price: 3.75, description: 'Espresso con espuma de leche', stock: 100 },
  { name: 'Espresso', price: 2.00, description: 'Café concentrado', stock: 100 },
  { name: 'Mocha', price: 4.00, description: 'Café con chocolate', stock: 100 },
  { name: 'Macchiato', price: 3.25, description: 'Espresso con un toque de leche', stock: 100 },
  { name: 'Café Frappé', price: 4.50, description: 'Café helado batido', stock: 80 },
  { name: 'Té Verde', price: 2.25, description: 'Té verde natural', stock: 120 },
  { name: 'Té Negro', price: 2.25, description: 'Té negro clásico', stock: 120 },
  { name: 'Chocolate Caliente', price: 3.00, description: 'Chocolate con leche caliente', stock: 90 },
  { name: 'Croissant', price: 2.50, description: 'Croissant de mantequilla', stock: 50 },
  { name: 'Muffin de Arándanos', price: 2.75, description: 'Muffin casero con arándanos', stock: 40 },
  { name: 'Brownie', price: 3.00, description: 'Brownie de chocolate', stock: 45 },
  { name: 'Cheesecake', price: 4.50, description: 'Pastel de queso', stock: 30 },
  { name: 'Galletas', price: 1.50, description: 'Galletas de chocolate', stock: 80 },
  { name: 'Sándwich de Jamón', price: 5.00, description: 'Sándwich de jamón y queso', stock: 35 },
  { name: 'Sándwich Vegetariano', price: 4.75, description: 'Sándwich con vegetales frescos', stock: 35 },
  { name: 'Ensalada César', price: 6.00, description: 'Ensalada césar clásica', stock: 25 },
  { name: 'Jugo Natural', price: 3.50, description: 'Jugo de frutas frescas', stock: 60 },
  { name: 'Agua Mineral', price: 1.50, description: 'Agua embotellada', stock: 150 }
];

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Conectar a la base de datos
    await getDatabase();

    // Limpiar datos existentes (opcional)
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('¿Deseas limpiar la base de datos antes de poblarla? (s/n): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
      await clearDatabase();
      console.log('🗑️  Base de datos limpiada');
    }

    // Crear productos
    console.log('📦 Creando productos...');
    let created = 0;

    for (const productData of sampleProducts) {
      try {
        const product = new Product(productData);
        await productRepository.create(product);
        created++;
        console.log(`   ✓ ${productData.name} - $${productData.price}`);
      } catch (error) {
        console.error(`   ✗ Error creando ${productData.name}:`, error);
      }
    }

    console.log('\n✅ Seed completado!');
    console.log(`📊 Productos creados: ${created}/${sampleProducts.length}`);
    console.log('\n🚀 Puedes iniciar el servidor con: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar seed
seed();
