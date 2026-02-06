
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
        
        const config = {
            ...options,
            headers: {
                ...API_CONFIG.headers,
                ...options.headers
            }
        };
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Error en la petición:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

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

window.API = {
    products: ProductsAPI,
    sales: SalesAPI,
    reports: ReportsAPI
};