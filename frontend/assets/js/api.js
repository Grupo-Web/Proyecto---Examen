// ============================================
// ARCHIVO: frontend/assets/js/api.js
// RESPONSABLE: [Tu Nombre]
// DESCRIPCIÓN: Maneja toda la comunicación con el backend
// ============================================

const API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
};

const ENDPOINTS = {
    products: {
        getAll: '/products',
        getById: (id) => `/products/${id}`,
        create: '/products',
        update: (id) => `/products/${id}`,
        delete: (id) => `/products/${id}`
    },
    sales: {
        getAll: '/sales',
        create: '/sales',
        getById: (id) => `/sales/${id}`
    },
    reports: {
        getSalesReport: '/reports/sales'
    }
};

async function makeRequest(endpoint, options = {}) {
    try {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        
        console.log('🌐 Petición:', options.method || 'GET', url);
        if (options.body) {
            console.log('📦 Datos:', JSON.parse(options.body));
        }
        
        const config = {
            ...options,
            headers: {
                ...API_CONFIG.headers,
                ...options.headers
            }
        };
        
        const response = await fetch(url, config);
        
        console.log('📡 Respuesta:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Éxito:', data);
        
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        let errorMessage = error.message;
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = `No se puede conectar con el servidor.
            
Verifica:
1. El backend está corriendo (npm run dev)
2. El puerto es correcto (${API_CONFIG.baseURL})
3. CORS está habilitado

Error: ${error.message}`;
        }
        
        return { 
            success: false, 
            error: errorMessage
        };
    }
}

/**
 * API de Productos
 * Campos obligatorios para crear:
 * - name (string)
 * - category (string)
 * - price (number, > 0)
 * - stock (number, >= 0)
 * - description (string, opcional)
 */
const ProductsAPI = {
    getAll: async () => {
        return await makeRequest(ENDPOINTS.products.getAll, {
            method: 'GET'
        });
    },
    
    getById: async (id) => {
        return await makeRequest(ENDPOINTS.products.getById(id), {
            method: 'GET'
        });
    },
    
    create: async (productData) => {
        return await makeRequest(ENDPOINTS.products.create, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },
    
    update: async (id, productData) => {
        return await makeRequest(ENDPOINTS.products.update(id), {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },
    
    delete: async (id) => {
        return await makeRequest(ENDPOINTS.products.delete(id), {
            method: 'DELETE'
        });
    }
};

const SalesAPI = {
    getAll: async () => {
        return await makeRequest(ENDPOINTS.sales.getAll, {
            method: 'GET'
        });
    },
    
    create: async (saleData) => {
        return await makeRequest(ENDPOINTS.sales.create, {
            method: 'POST',
            body: JSON.stringify(saleData)
        });
    },
    
    getById: async (id) => {
        return await makeRequest(ENDPOINTS.sales.getById(id), {
            method: 'GET'
        });
    }
};

const ReportsAPI = {
    getSalesReport: async () => {
        return await makeRequest(ENDPOINTS.reports.getSalesReport, {
            method: 'GET'
        });
    }
};

// Exportar API global
window.API = {
    products: ProductsAPI,
    sales: SalesAPI,
    reports: ReportsAPI
};

console.log('✅ API inicializada correctamente');
console.log('📍 Base URL:', API_CONFIG.baseURL);
console.log('💡 Ejemplo: API.products.create({ name, category, price, stock })');