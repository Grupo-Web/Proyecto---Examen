# 🏛️ Arquitectura Hexagonal - Explicación

## ¿Qué es la Arquitectura Hexagonal?
También conocida como "Ports and Adapters", separa la lógica de negocio de los detalles técnicos.

## 📊 Capas del Sistema

### 1. Domain (Dominio) 🎯
**Responsabilidad:** Reglas de negocio puras
```
domain/
├── entities/          # Product, Sale, SaleItem
└── repositories/      # Interfaces (contratos)
```

**Características:**
- ❌ NO tiene dependencias externas
- ✅ Define interfaces (contratos)
- ✅ Contiene entidades y validaciones

### 2. Application (Aplicación) 💼
**Responsabilidad:** Casos de uso del sistema
```
application/
├── create-sale.usecase.ts
├── get-sales-report.usecase.ts
└── export-report.usecase.ts
```

**Características:**
- ✅ Implementa los casos de uso
- ✅ Coordina entidades y repositorios
- ❌ NO sabe de HTTP, bases de datos, etc.

### 3. Infrastructure (Infraestructura) 🔧
**Responsabilidad:** Implementaciones técnicas
```
infrastructure/
├── database/sqlite/
└── repositories/     # Implementaciones reales
```

**Características:**
- ✅ Implementa las interfaces del dominio
- ✅ Maneja detalles técnicos (SQLite)

### 4. Interfaces (API REST) 🌐
**Responsabilidad:** Adaptadores de comunicación
```
interfaces/
├── controllers/      # Manejan HTTP requests
└── routes/          # Definen endpoints
```

## 🔄 Flujo de una Petición
```
Frontend → Route → Controller → UseCase → Repository → SQLite
```

## 🎓 Ventajas
1. Código profesional (nivel empresarial)
2. Testeable y mantenible
3. Separación de responsabilidades
4. Escalable y flexible

## 📋 Relación con el Proyecto

### MANTENEDOR (Productos)
```
Route → Controller → Use Case → Repository → SQLite
  /api/products      CRUD de productos
```

### PROCESO (Ventas)
```
Route → Controller → Use Case → Repository → SQLite
  /api/sales         Registrar venta
  /api/reports       Generar análisis
```
