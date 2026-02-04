/**
 * Database Seed Script
 * Pobla la base de datos con datos de ejemplo para pruebas
 */

import { ProductRepositoryImpl } from '../repositories/product.repository.impl.js';
import { clearDatabase } from './sqlite/sqlite.connection.js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function seed() {
  try {
    console.log('🌱 Iniciando proceso de seed...\n');

    // Preguntar si desea limpiar la base de datos
    const clearDb = await question('¿Desea limpiar la base de datos antes de insertar datos? (s/n): ');
    
    if (clearDb.toLowerCase() === 's' || clearDb.toLowerCase() === 'si') {
      console.log('🗑️  Limpiando base de datos...');
      await clearDatabase();
      console.log('✅ Base de datos limpiada\n');
    }

    const productRepository = new ProductRepositoryImpl();

    // Productos de ejemplo para una cafetería
    const products = [
      // Bebidas Calientes
      { name: 'Café Americano', description: 'Café negro clásico', price: 2.50, category: 'Bebidas Calientes', stock: 100 },
      { name: 'Café Latte', description: 'Espresso con leche vaporizada', price: 3.50, category: 'Bebidas Calientes', stock: 100 },
      { name: 'Cappuccino', description: 'Espresso con espuma de leche', price: 3.75, category: 'Bebidas Calientes', stock: 100 },
      { name: 'Espresso', description: 'Shot de café concentrado', price: 2.00, category: 'Bebidas Calientes', stock: 100 },
      { name: 'Mocha', description: 'Latte con chocolate', price: 4.00, category: 'Bebidas Calientes', stock: 80 },
      { name: 'Té Verde', description: 'Té verde orgánico', price: 2.50, category: 'Bebidas Calientes', stock: 60 },
      { name: 'Chocolate Caliente', description: 'Bebida de chocolate cremosa', price: 3.50, category: 'Bebidas Calientes', stock: 50 },

      // Bebidas Frías
      { name: 'Café Frappé', description: 'Café helado batido', price: 4.50, category: 'Bebidas Frías', stock: 70 },
      { name: 'Limonada', description: 'Limonada natural', price: 3.00, category: 'Bebidas Frías', stock: 50 },
      { name: 'Smoothie de Frutas', description: 'Batido de frutas frescas', price: 5.00, category: 'Bebidas Frías', stock: 40 },
      { name: 'Té Helado', description: 'Té frío con limón', price: 3.00, category: 'Bebidas Frías', stock: 60 },

      // Postres
      { name: 'Brownie', description: 'Brownie de chocolate', price: 3.50, category: 'Postres', stock: 30 },
      { name: 'Cheesecake', description: 'Pastel de queso', price: 4.50, category: 'Postres', stock: 25 },
      { name: 'Muffin de Arándanos', description: 'Muffin casero', price: 3.00, category: 'Postres', stock: 40 },
      { name: 'Galletas', description: 'Galletas con chips de chocolate', price: 2.50, category: 'Postres', stock: 50 },

      // Snacks
      { name: 'Sándwich de Pollo', description: 'Sándwich fresco de pollo', price: 6.00, category: 'Snacks', stock: 25 },
      { name: 'Ensalada César', description: 'Ensalada fresca', price: 5.50, category: 'Snacks', stock: 20 },
      { name: 'Bagel con Queso Crema', description: 'Bagel tostado', price: 4.00, category: 'Snacks', stock: 30 },
      { name: 'Croissant', description: 'Croissant de mantequilla', price: 3.50, category: 'Snacks', stock: 35 },
      { name: 'Wrap Vegetariano', description: 'Wrap con vegetales', price: 5.50, category: 'Snacks', stock: 20 }
    ];

    console.log('📦 Insertando productos...\n');

    for (const product of products) {
      await productRepository.save({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        createdAt: new Date()
      });
      console.log(`✅ ${product.name} - $${product.price}`);
    }

    console.log('\n✅ Seed completado exitosamente!');
    console.log(`📊 Total de productos insertados: ${products.length}\n`);
    
    // Mostrar resumen por categoría
    const categories = [...new Set(products.map(p => p.category))];
    console.log('📋 Resumen por categoría:');
    for (const category of categories) {
      const count = products.filter(p => p.category === category).length;
      console.log(`   • ${category}: ${count} productos`);
    }

    rl.close();
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    rl.close();
    process.exit(1);
  }
}

seed();