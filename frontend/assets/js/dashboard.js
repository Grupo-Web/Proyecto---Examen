// dashboard.js — Consume datos reales del backend
const API_URL = 'http://localhost:3000/api';

// Variable para evitar múltiples cargas simultáneas
let isLoading = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Prevenir múltiples ejecuciones
    if (isLoading) return;
    isLoading = true;

    try {
        // Mostrar indicador de carga
        showLoading();

        // Obtener datos del backend con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

        const salesResponse = await fetch(`${API_URL}/sales`, { 
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);

        if (!salesResponse.ok) {
            throw new Error(`Error HTTP: ${salesResponse.status}`);
        }

        const salesData = await salesResponse.json();

        // Validar que salesData sea un array
        if (!Array.isArray(salesData)) {
            throw new Error('Los datos recibidos no son válidos');
        }

        // Procesar datos
        const stats = calculateStatistics(salesData);
        const weeklyData = getWeeklyData(salesData);
        const productDistribution = getProductDistribution(salesData);
        const recentSales = getRecentSales(salesData);

        // Actualizar tarjetas resumen
        updateSummaryCards(stats);

        // Renderizar gráficas
        renderLineChart(weeklyData);
        renderDonutChart(productDistribution);

        // Llenar tabla de ventas recientes
        fillRecentSalesTable(recentSales);

        // Ocultar indicador de carga
        hideLoading();

    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        hideLoading();
        
        if (error.name === 'AbortError') {
            showError('La solicitud tardó demasiado. Por favor, verifica tu conexión e intenta de nuevo.');
        } else {
            showError('Error al cargar los datos. Por favor, verifica que el servidor esté corriendo en http://localhost:3000');
        }
    } finally {
        isLoading = false;
    }
});

/**
 * Calcula estadísticas generales de las ventas
 */
function calculateStatistics(sales) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    const todaySales = sales
        .filter(sale => {
            const saleDate = new Date(sale.date);
            saleDate.setHours(0, 0, 0, 0);
            return saleDate.getTime() === today.getTime();
        })
        .reduce((sum, sale) => sum + sale.total, 0);

    // Contar productos vendidos
    const productCounts = {};
    sales.forEach(sale => {
        sale.items.forEach(item => {
            productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
        });
    });

    const topProduct = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])[0];

    return {
        totalSales,
        todaySales,
        topProduct: topProduct ? topProduct[0] : '-'
    };
}

/**
 * Obtiene datos de ventas de la última semana
 */
function getWeeklyData(sales) {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    const weekData = {};

    // Inicializar últimos 7 días
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dayName = days[date.getDay()];
        weekData[dayName] = { date: date.getTime(), total: 0 };
    }

    // Sumar ventas por día
    sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        saleDate.setHours(0, 0, 0, 0);
        const dayName = days[saleDate.getDay()];
        
        if (weekData[dayName] && saleDate.getTime() === weekData[dayName].date) {
            weekData[dayName].total += sale.total;
        }
    });

    return {
        labels: Object.keys(weekData),
        data: Object.values(weekData).map(d => d.total)
    };
}

/**
 * Obtiene distribución de ventas por producto
 */
function getProductDistribution(sales) {
    const productData = {};

    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!productData[item.productName]) {
                productData[item.productName] = {
                    quantity: 0,
                    revenue: 0
                };
            }
            productData[item.productName].quantity += item.quantity;
            productData[item.productName].revenue += item.subtotal;
        });
    });

    // Ordenar por cantidad y tomar top 5
    const sorted = Object.entries(productData)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 5);

    return {
        labels: sorted.map(([name]) => name),
        data: sorted.map(([, data]) => data.quantity)
    };
}

/**
 * Obtiene las ventas más recientes
 */
function getRecentSales(sales) {
    // Ordenar por fecha descendente y tomar las últimas 10
    return sales
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10)
        .map(sale => {
            const date = new Date(sale.date);
            return {
                time: date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
                date: date.toLocaleDateString('es-EC'),
                products: sale.items.map(item => `${item.productName} (x${item.quantity})`).join(', '),
                total: `$${sale.total.toFixed(2)}`
            };
        });
}

/**
 * Actualiza las tarjetas de resumen
 */
function updateSummaryCards(stats) {
    document.getElementById('total-sales').textContent = `$${stats.totalSales.toFixed(2)}`;
    document.getElementById('today-sales').textContent = `$${stats.todaySales.toFixed(2)}`;
    document.getElementById('top-product').textContent = stats.topProduct;
}

/**
 * Renderiza gráfica de línea de ventas semanales
 */
function renderLineChart(weeklyData) {
    const ctxLine = document.getElementById('salesLineChart').getContext('2d');
    const coffeeColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--coffee-dark').trim() || '#4b2e1e';

    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: weeklyData.labels,
            datasets: [{
                label: 'Ventas',
                data: weeklyData.data,
                borderColor: coffeeColor,
                backgroundColor: 'rgba(75, 46, 30, 0.08)',
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: coffeeColor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Ventas: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/**
 * Renderiza gráfica donut de distribución por producto
 */
function renderDonutChart(productDistribution) {
    const ctxDonut = document.getElementById('productDonutChart').getContext('2d');
    const coffeeLight = getComputedStyle(document.documentElement)
        .getPropertyValue('--coffee-light').trim() || '#a67c52';

    // Generar colores basados en el color principal
    const colors = [
        coffeeLight,
        '#c6936b',
        '#e8d8c8',
        '#7d5542',
        '#5c3d2e'
    ];

    new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
            labels: productDistribution.labels,
            datasets: [{
                data: productDistribution.data,
                backgroundColor: colors.slice(0, productDistribution.labels.length),
                hoverOffset: 6,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value} unidades`;
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/**
 * Llena la tabla de ventas recientes
 */
function fillRecentSalesTable(recentSales) {
    const tbody = document.querySelector('#recent-sales-table tbody');
    tbody.innerHTML = ''; // Limpiar contenido previo

    if (recentSales.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4" style="text-align:center; color:#999;">No hay ventas registradas</td>';
        tbody.appendChild(tr);
        return;
    }

    recentSales.forEach(sale => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sale.time}<br><small style="color:#999;">${sale.date}</small></td>
            <td>${sale.products}</td>
            <td>-</td>
            <td><strong>${sale.total}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Muestra indicador de carga
 */
function showLoading() {
    const cards = document.querySelectorAll('.card-value');
    cards.forEach(card => {
        card.textContent = 'Cargando...';
        card.style.opacity = '0.5';
    });
}

/**
 * Oculta indicador de carga
 */
function hideLoading() {
    const cards = document.querySelectorAll('.card-value');
    cards.forEach(card => {
        card.style.opacity = '1';
    });
}

/**
 * Muestra mensaje de error
 */
function showError(message) {
    // Remover error previo si existe
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'background:#fee; border:1px solid #c33; color:#c33; padding:1rem; border-radius:6px; margin:1rem 0;';
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
    
    // Actualizar cards con mensaje de error
    document.getElementById('total-sales').textContent = '-';
    document.getElementById('today-sales').textContent = '-';
    document.getElementById('top-product').textContent = '-';
}