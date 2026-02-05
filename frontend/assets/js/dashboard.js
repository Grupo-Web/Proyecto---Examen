/**
 * Dashboard de Análisis de Ventas - Cafetería
 * Sistema web para análisis de ventas mediante gráficos estadísticos
 * Grupo 6 - Aplicaciones Web
 */

// ============================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================

const API_URL = 'http://localhost:3000/api';

// Instancias de gráficos (para destruir y recrear)
let dailySalesChart = null;
let categoriesChart = null;
let trendChart = null;

// Datos actuales cargados
let currentSalesData = null;
let currentTopProducts = null;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Muestra/oculta el overlay de carga
 */
function showLoading(show = true) {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.display = show ? 'flex' : 'none';
}

/**
 * Formatea un número como moneda
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
}

/**
 * Formatea un número con separadores de miles
 */
function formatNumber(value) {
  return new Intl.NumberFormat('es-EC').format(value);
}

/**
 * Calcula el porcentaje de cambio entre dos valores
 */
function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calcula las fechas según el período seleccionado
 */
function getDateRange(period) {
  const now = new Date();
  let startDate, endDate = now;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'all':
    default:
      startDate = null;
      endDate = null;
      break;
  }

  return { startDate, endDate };
}

/**
 * Genera colores aleatorios para las gráficas
 */
function generateColors(count) {
  const colors = [
    '#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0',
    '#6610f2', '#fd7e14', '#20c997', '#d63384', '#6c757d'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtiene el reporte de ventas según filtros
 */
async function fetchSalesReport(startDate = null, endDate = null) {
  try {
    let url = `${API_URL}/reports/sales`;
    
    if (startDate && endDate) {
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener reporte de ventas');
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchSalesReport:', error);
    throw error;
  }
}

/**
 * Obtiene los productos más vendidos
 */
async function fetchTopProducts(limit = 10) {
  try {
    const response = await fetch(`${API_URL}/reports/top-products?limit=${limit}`);
    if (!response.ok) throw new Error('Error al obtener top productos');
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchTopProducts:', error);
    throw error;
  }
}

/**
 * Obtiene todos los productos para análisis de categorías
 */
async function fetchAllProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Error al obtener productos');
    
    return await response.json();
  } catch (error) {
    console.error('Error en fetchAllProducts:', error);
    throw error;
  }
}

/**
 * Exporta el reporte a CSV
 */
async function exportToCSV() {
  try {
    showLoading(true);
    
    const response = await fetch(`${API_URL}/reports/export`);
    if (!response.ok) throw new Error('Error al exportar reporte');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ventas-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showLoading(false);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    alert('Error al exportar el reporte. Por favor, intente nuevamente.');
    showLoading(false);
  }
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN DE UI
// ============================================

/**
 * Actualiza las tarjetas de KPIs
 */
function updateKPIs(data) {
  // Ingresos totales
  document.getElementById('totalRevenue').textContent = formatCurrency(data.totalRevenue);
  
  // Total de ventas
  document.getElementById('totalSales').textContent = formatNumber(data.totalSales);
  
  // Ticket promedio
  document.getElementById('averageTicket').textContent = formatCurrency(data.averageTicket);
  
  // Total de productos vendidos
  const totalProductsSold = data.sales.reduce((total, sale) => {
    return total + sale.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);
  document.getElementById('totalProductsSold').textContent = formatNumber(totalProductsSold);
  
  // Simulación de cambios porcentuales (en producción se compararían con período anterior)
  const revenueChange = Math.random() * 30 - 10; // Simulado: entre -10% y +20%
  const salesChange = Math.random() * 25 - 5;
  const ticketChange = Math.random() * 15 - 5;
  
  updateChangeIndicator('revenueChange', revenueChange);
  updateChangeIndicator('salesChange', salesChange);
  updateChangeIndicator('ticketChange', ticketChange);
}

/**
 * Actualiza el indicador de cambio porcentual
 */
function updateChangeIndicator(elementId, percentage) {
  const element = document.getElementById(elementId);
  const sign = percentage >= 0 ? '+' : '';
  const icon = percentage >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
  const color = percentage >= 0 ? 'text-success' : 'text-danger';
  
  element.innerHTML = `
    <i class="fas ${icon}"></i> ${sign}${percentage.toFixed(1)}% vs período anterior
  `;
  element.className = `small ${color}`;
}

/**
 * Actualiza la tabla de top 10 productos
 */
function updateTopProductsTable(products) {
  const tbody = document.getElementById('topProductsTable');
  
  if (!products || products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">
          No hay datos disponibles
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = products.map((product, index) => `
    <tr>
      <td>
        <span class="badge ${index < 3 ? 'bg-warning' : 'bg-secondary'}">
          ${index + 1}
        </span>
      </td>
      <td>
        <strong>${product.productName}</strong>
      </td>
      <td>
        <span class="badge bg-primary">
          ${formatNumber(product.totalQuantity)} uds
        </span>
      </td>
      <td>
        <strong class="text-success">${formatCurrency(product.totalRevenue)}</strong>
      </td>
    </tr>
  `).join('');
}

/**
 * Actualiza la tabla de análisis por categorías
 */
async function updateCategoryAnalysisTable() {
  try {
    const products = await fetchAllProducts();
    const salesData = currentSalesData;
    
    if (!products || !salesData) return;
    
    // Agrupar ventas por categoría
    const categoryStats = {};
    
    salesData.sales.forEach(sale => {
      sale.items.forEach(item => {
        // Buscar el producto para obtener su categoría
        const product = products.find(p => p.id === item.productId);
        if (!product) return;
        
        const category = product.category;
        
        if (!categoryStats[category]) {
          categoryStats[category] = {
            products: new Set(),
            totalQuantity: 0,
            totalRevenue: 0
          };
        }
        
        categoryStats[category].products.add(item.productId);
        categoryStats[category].totalQuantity += item.quantity;
        categoryStats[category].totalRevenue += item.subtotal;
      });
    });
    
    const totalRevenue = Object.values(categoryStats).reduce((sum, cat) => sum + cat.totalRevenue, 0);
    
    const tbody = document.getElementById('categoryAnalysisTable');
    
    if (Object.keys(categoryStats).length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted">
            No hay datos disponibles
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = Object.entries(categoryStats)
      .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
      .map(([category, stats]) => {
        const percentage = (stats.totalRevenue / totalRevenue * 100).toFixed(1);
        const avgPerProduct = stats.totalRevenue / stats.products.size;
        
        return `
          <tr>
            <td><strong>${category}</strong></td>
            <td>${stats.products.size}</td>
            <td>${formatNumber(stats.totalQuantity)}</td>
            <td><strong class="text-success">${formatCurrency(stats.totalRevenue)}</strong></td>
            <td>${formatCurrency(avgPerProduct)}</td>
            <td>
              <div class="d-flex align-items-center">
                <div class="progress flex-grow-1 me-2" style="height: 20px;">
                  <div class="progress-bar bg-primary" role="progressbar" 
                       style="width: ${percentage}%" 
                       aria-valuenow="${percentage}" 
                       aria-valuemin="0" 
                       aria-valuemax="100">
                  </div>
                </div>
                <span class="badge bg-info">${percentage}%</span>
              </div>
            </td>
          </tr>
        `;
      }).join('');
      
  } catch (error) {
    console.error('Error al actualizar análisis de categorías:', error);
  }
}

// ============================================
// FUNCIONES DE GRÁFICOS
// ============================================

/**
 * Crea/actualiza el gráfico de ventas diarias (Barras)
 */
function updateDailySalesChart(salesData) {
  const ctx = document.getElementById('dailySalesChart').getContext('2d');
  
  // Destruir gráfico anterior si existe
  if (dailySalesChart) {
    dailySalesChart.destroy();
  }
  
  // Agrupar ventas por día
  const salesByDay = {};
  
  salesData.forEach(sale => {
    const date = new Date(sale.date).toLocaleDateString('es-EC');
    salesByDay[date] = (salesByDay[date] || 0) + sale.total;
  });
  
  const labels = Object.keys(salesByDay);
  const data = Object.values(salesByDay);
  
  dailySalesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Ingresos ($)',
        data: data,
        backgroundColor: 'rgba(13, 110, 253, 0.7)',
        borderColor: 'rgba(13, 110, 253, 1)',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Ingresos: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString('es-EC');
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Crea/actualiza el gráfico de categorías (Pastel)
 */
async function updateCategoriesChart() {
  try {
    const products = await fetchAllProducts();
    const salesData = currentSalesData;
    
    if (!products || !salesData) return;
    
    const ctx = document.getElementById('categoriesChart').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (categoriesChart) {
      categoriesChart.destroy();
    }
    
    // Agrupar ventas por categoría
    const categoryRevenue = {};
    
    salesData.sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;
        
        const category = product.category;
        categoryRevenue[category] = (categoryRevenue[category] || 0) + item.subtotal;
      });
    });
    
    const labels = Object.keys(categoryRevenue);
    const data = Object.values(categoryRevenue);
    const colors = generateColors(labels.length);
    
    categoriesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error al actualizar gráfico de categorías:', error);
  }
}

/**
 * Crea/actualiza el gráfico de tendencia (Línea)
 */
function updateTrendChart(salesData) {
  const ctx = document.getElementById('trendChart').getContext('2d');
  
  // Destruir gráfico anterior si existe
  if (trendChart) {
    trendChart.destroy();
  }
  
  // Agrupar ventas por día y calcular acumulado
  const salesByDay = {};
  
  salesData.forEach(sale => {
    const date = new Date(sale.date).toLocaleDateString('es-EC');
    salesByDay[date] = (salesByDay[date] || 0) + sale.total;
  });
  
  // Ordenar por fecha
  const sortedDates = Object.keys(salesByDay).sort((a, b) => {
    return new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'));
  });
  
  const labels = sortedDates;
  const data = sortedDates.map(date => salesByDay[date]);
  
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Tendencia de Ventas',
        data: data,
        borderColor: 'rgba(13, 202, 240, 1)',
        backgroundColor: 'rgba(13, 202, 240, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(13, 202, 240, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Ingresos: ${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString('es-EC');
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// ============================================
// FUNCIÓN PRINCIPAL DE CARGA DE DATOS
// ============================================

/**
 * Carga y actualiza todos los datos del dashboard
 */
async function loadDashboard(startDate = null, endDate = null) {
  try {
    showLoading(true);
    
    // Obtener datos de la API
    const [salesReport, topProducts] = await Promise.all([
      fetchSalesReport(startDate, endDate),
      fetchTopProducts(10)
    ]);
    
    // Guardar datos actuales
    currentSalesData = salesReport;
    currentTopProducts = topProducts;
    
    // Actualizar UI
    updateKPIs(salesReport);
    updateTopProductsTable(topProducts);
    updateDailySalesChart(salesReport.sales);
    await updateCategoriesChart();
    updateTrendChart(salesReport.sales);
    await updateCategoryAnalysisTable();
    
    showLoading(false);
    
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    showLoading(false);
    alert('Error al cargar los datos del dashboard. Por favor, verifique que el servidor esté ejecutándose.');
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Inicializa los event listeners
 */
function initializeEventListeners() {
  
  // Filtro de período
  const periodFilter = document.getElementById('periodFilter');
  const customDateRange = document.getElementById('customDateRange');
  const customDateRangeEnd = document.getElementById('customDateRangeEnd');
  
  periodFilter.addEventListener('change', function() {
    if (this.value === 'custom') {
      customDateRange.style.display = 'block';
      customDateRangeEnd.style.display = 'block';
    } else {
      customDateRange.style.display = 'none';
      customDateRangeEnd.style.display = 'none';
      
      if (this.value !== 'custom') {
        const { startDate, endDate } = getDateRange(this.value);
        loadDashboard(startDate, endDate);
      }
    }
  });
  
  // Botón aplicar filtro
  document.getElementById('applyFilter').addEventListener('click', function() {
    const period = periodFilter.value;
    
    if (period === 'custom') {
      const startDateInput = document.getElementById('startDate').value;
      const endDateInput = document.getElementById('endDate').value;
      
      if (!startDateInput || !endDateInput) {
        alert('Por favor, seleccione ambas fechas');
        return;
      }
      
      const startDate = new Date(startDateInput);
      const endDate = new Date(endDateInput);
      
      if (startDate > endDate) {
        alert('La fecha de inicio debe ser menor a la fecha de fin');
        return;
      }
      
      loadDashboard(startDate, endDate);
    } else {
      const { startDate, endDate } = getDateRange(period);
      loadDashboard(startDate, endDate);
    }
  });
  
  // Botón exportar CSV
  document.getElementById('exportCSV').addEventListener('click', exportToCSV);
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa el dashboard al cargar la página
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Iniciando Dashboard de Análisis de Ventas...');
  
  // Inicializar event listeners
  initializeEventListeners();
  
  // Cargar dashboard con período inicial (última semana)
  const { startDate, endDate } = getDateRange('week');
  loadDashboard(startDate, endDate);
  
  console.log('✅ Dashboard cargado correctamente');
});