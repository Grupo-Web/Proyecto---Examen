/**
 * Migración: Agregar columna 'category' a la tabla products
 */
import { getDatabase } from './sqlite.connection.js';

async function addCategoryColumn() {
  try {
    console.log('🔧 Iniciando migración: Agregar columna category...');
    
    const db = await getDatabase();
    
    // Verificar si la columna ya existe
    const tableInfo = await db.all(`PRAGMA table_info(products)`);
    const categoryExists = tableInfo.some((col: any) => col.name === 'category');
    
    if (categoryExists) {
      console.log('✅ La columna category ya existe. No es necesario migrar.');
      return;
    }
    
    // Agregar columna category con valor por defecto
    await db.exec(`
      ALTER TABLE products 
      ADD COLUMN category TEXT NOT NULL DEFAULT 'General'
    `);
    
    console.log('✅ Columna category agregada exitosamente');
    
    // Actualizar productos existentes (opcional)
    const result = await db.run(`
      UPDATE products 
      SET category = 'Sin categoría' 
      WHERE category = 'General'
    `);
    
    console.log(`✅ ${result.changes} productos actualizados`);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Ejecutar migración
addCategoryColumn()
  .then(() => {
    console.log('✅ Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migración fallida:', error);
    process.exit(1);
  });