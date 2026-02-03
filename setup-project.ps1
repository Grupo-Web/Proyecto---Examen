Write-Host "🚀 Creando estructura completa del proyecto..." -ForegroundColor Cyan

# Raíz
$folders = @(
    "backend/src/domain/entities",
    "backend/src/domain/repositories",
    "backend/src/domain/errors",

    "backend/src/application",

    "backend/src/infrastructure/database/mysql",
    "backend/src/infrastructure/database/sqlite",
    "backend/src/infrastructure/repositories",
    "backend/src/infrastructure/config",

    "backend/src/interfaces/controllers",
    "backend/src/interfaces/routes",

    "backend/src/tests",
    "backend/dist",

    "frontend/assets/css",
    "frontend/assets/js",
    "frontend/assets/libs"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# Archivos Backend
$backendFiles = @(
    "backend/src/domain/entities/sale.entity.ts",
    "backend/src/domain/entities/product.entity.ts",
    "backend/src/domain/entities/category.entity.ts",
    "backend/src/domain/entities/sale-item.entity.ts",

    "backend/src/domain/repositories/sale.repository.ts",
    "backend/src/domain/repositories/product.repository.ts",
    "backend/src/domain/repositories/category.repository.ts",

    "backend/src/domain/errors/domain.error.ts",

    "backend/src/application/create-sale.usecase.ts",
    "backend/src/application/get-sales-report.usecase.ts",
    "backend/src/application/get-top-products.usecase.ts",
    "backend/src/application/export-report.usecase.ts",

    "backend/src/infrastructure/database/mysql/mysql.connection.ts",
    "backend/src/infrastructure/database/sqlite/sqlite.connection.ts",

    "backend/src/infrastructure/repositories/sale.repository.impl.ts",
    "backend/src/infrastructure/repositories/product.repository.impl.ts",
    "backend/src/infrastructure/repositories/category.repository.impl.ts",

    "backend/src/infrastructure/config/env.config.ts",

    "backend/src/interfaces/controllers/sale.controller.ts",
    "backend/src/interfaces/controllers/product.controller.ts",
    "backend/src/interfaces/controllers/report.controller.ts",

    "backend/src/interfaces/routes/sale.routes.ts",
    "backend/src/interfaces/routes/product.routes.ts",
    "backend/src/interfaces/routes/report.routes.ts",

    "backend/src/tests/test-sale.ts",
    "backend/src/tests/test-product.ts",
    "backend/src/tests/test-category.ts",

    "backend/src/app.ts",
    "backend/src/server.ts"
)

foreach ($file in $backendFiles) {
    New-Item -ItemType File -Force -Path $file | Out-Null
}

# Archivos Frontend
$frontendFiles = @(
    "frontend/index.html",
    "frontend/dashboard.html",
    "frontend/register-sale.html",
    "frontend/products.html",

    "frontend/assets/css/main.css",
    "frontend/assets/css/dashboard.css",

    "frontend/assets/js/api.js",
    "frontend/assets/js/register-sale.js",
    "frontend/assets/js/dashboard.js",
    "frontend/assets/js/products.js",

    "frontend/assets/libs/chart.min.js"
)

foreach ($file in $frontendFiles) {
    New-Item -ItemType File -Force -Path $file | Out-Null
}

Write-Host "✅ Estructura creada correctamente" -ForegroundColor Green
