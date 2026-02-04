/**
 * SQLite Connection - Infrastructure Layer
 * Maneja la conexión y creación de tablas en SQLite
 */

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ruta ABSOLUTA al archivo de base de datos (en la raíz del proyecto)
const projectRoot = join(__dirname, '..', '..', '..', '..');
const dataDir = join(projectRoot, 'data');
const DB_PATH = join(dataDir, 'cafeteria.db');

let db: Database | null = null;

/**
 * Obtiene o crea la conexión a la base de datos
 */
export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  // Crear directorio data si no existe
  try {
    if (!existsSync(dataDir)) {
      console.log(`📁 Creando directorio: ${dataDir}`);
      mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.error('❌ Error creando directorio data:', error);
    throw new Error(`No se pudo crear el directorio: ${dataDir}`);
  }

  // Abrir conexión
  try {
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Habilitar foreign keys
    await db.exec('PRAGMA foreign_keys = ON;');

    // Crear tablas si no existen
    await createTables(db);

    console.log('✅ Conexión a SQLite establecida');
    console.log(`📁 Base de datos: ${DB_PATH}`);

    return db;
  } catch (error) {
    console.error('❌ Error abriendo base de datos:', error);
    throw error;
  }
}

/**
 * Crea las tablas de la base de datos
 */
async function createTables(database: Database): Promise<void> {
  try {
    // Tabla de productos
    await database.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL CHECK(price > 0),
        description TEXT DEFAULT '',
        stock INTEGER DEFAULT 0 CHECK(stock >= 0),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Tabla de ventas
    await database.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        total REAL NOT NULL CHECK(total > 0),
        sale_date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Tabla de items de venta
    await database.exec(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        unit_price REAL NOT NULL CHECK(unit_price > 0),
        subtotal REAL NOT NULL CHECK(subtotal > 0),
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    // Índices para mejorar rendimiento
    await database.exec(`
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
      CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
      CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
    `);

    console.log('✅ Tablas creadas/verificadas');
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
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
    console.log('✅ Conexión a SQLite cerrada');
  }
}

/**
 * Limpia todas las tablas (útil para testing)
 */
export async function clearDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.exec('DELETE FROM sale_items;');
  await database.exec('DELETE FROM sales;');
  await database.exec('DELETE FROM products;');
  console.log('✅ Base de datos limpiada');
}
