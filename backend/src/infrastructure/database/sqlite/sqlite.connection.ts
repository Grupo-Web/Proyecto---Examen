import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '../../../../');
const dataDir = join(projectRoot, 'data');
const dbPath = join(dataDir, 'cafeteria.db');

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  try {
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      console.log(`✅ Directorio creado: ${dataDir}`);
    }

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log(`✅ Base de datos conectada: ${dbPath}`);

    await createTables();

    return db;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  const database = await getDatabase();

  await database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      total REAL NOT NULL,
      sale_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

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
    );
  `);

  console.log('✅ Tablas verificadas/creadas correctamente');
}

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

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('✅ Conexión a la base de datos cerrada');
  }
}
