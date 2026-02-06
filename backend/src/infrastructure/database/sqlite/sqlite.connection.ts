/**
 * SQLite Connection - Infrastructure Layer
 * Maneja la conexión a la base de datos SQLite y creación de tablas
 */
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta absoluta a la base de datos
const projectRoot = join(__dirname, '../../../../');
const dataDir = join(projectRoot, 'data');
const dbPath = join(dataDir, 'cafeteria.db');

let db: Database | null = null;

/**
 * Obtiene la conexión a la base de datos (Singleton)
 */
export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }
  
  try {
    // Crear directorio data/ si no existe
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      console.log(`✅ Directorio creado: ${dataDir}`);
    }
    
    // Abrir conexión a la base de datos
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log(`✅ Base de datos conectada: ${dbPath}`);
    
    // Crear tablas si no existen
    await createTables();
    
    return db;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
}

/**
 * Crea las tablas de la base de datos
 */
async function createTables(): Promise<void> {
  const database = await getDatabase();
  
  // Tabla de productos (CON CATEGORY)
  await database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,           
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  
  // Tabla de ventas
  await database.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      total REAL NOT NULL,
      sale_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  
  // Tabla de items de venta
  await database.exec(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  
  console.log('✅ Tablas verificadas/creadas correctamente');
}

/**
 * Limpia todas las tablas de la base de datos
 * ⚠️ CUIDADO: Esta función elimina TODOS los datos
 */
export async function clearDatabase(): Promise<void> {
  const database = await getDatabase();
  
  try {
    await database.exec(`
      DELETE FROM sale_items;
      DELETE FROM sales;
      DELETE FROM products;
    `);
    console.log('✅ Base de datos limpiada correctamente');
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    throw error;
  }
}

/**
 * Cierra la conexión a la base de datos
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('✅ Conexión a la base de datos cerrada');
  }
}