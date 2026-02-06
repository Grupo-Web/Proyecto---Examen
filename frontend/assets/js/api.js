
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
    
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    sales: {
        getAll: '/sales',                 
        create: '/sales',                 
        getById: (id) => `/sales/${id}`   
    },
    
<<<<<<< Updated upstream

=======
    // Reportes
>>>>>>> Stashed changes
    reports: {
        getSalesReport: '/reports/sales'   
    }
};

<<<<<<< Updated upstream
async function makeRequest(endpoint, options = {}) {
    try {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        
=======

async function makeRequest(endpoint, options = {}) {
    try {

        const url = `${API_CONFIG.baseURL}${endpoint}`;
        

>>>>>>> Stashed changes
        const config = {
            ...options,
            headers: {
                ...API_CONFIG.headers,
                ...options.headers
            }
        };
        
<<<<<<< Updated upstream
        const response = await fetch(url, config);
        
=======

        const response = await fetch(url, config);
        

>>>>>>> Stashed changes
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
        const data = await response.json();
        return { success: true, data };
        
    } catch (error) {
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
        console.error('❌ Error en la petición:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

<<<<<<< Updated upstream
const ProductsAPI = {
=======

const ProductsAPI = {

>>>>>>> Stashed changes
    getAll: async () => {
        return await makeRequest(ENDPOINTS.products.getAll, {
            method: 'GET'
        });
    },
    
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    getById: async (id) => {
        return await makeRequest(ENDPOINTS.products.getById(id), {
            method: 'GET'
        });
    },
    
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    create: async (productData) => {
        return await makeRequest(ENDPOINTS.products.create, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    },
    
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    update: async (id, productData) => {
        return await makeRequest(ENDPOINTS.products.update(id), {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    },
    
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    delete: async (id) => {
        return await makeRequest(ENDPOINTS.products.delete(id), {
            method: 'DELETE'
        });
    }
};

<<<<<<< Updated upstream
const SalesAPI = {
=======

const SalesAPI = {

>>>>>>> Stashed changes
    getAll: async () => {
        return await makeRequest(ENDPOINTS.sales.getAll, {
            method: 'GET'
        });
    },
    
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    create: async (saleData) => {
        return await makeRequest(ENDPOINTS.sales.create, {
            method: 'POST',
            body: JSON.stringify(saleData)
        });
    },
    
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    getById: async (id) => {
        return await makeRequest(ENDPOINTS.sales.getById(id), {
            method: 'GET'
        });
    }
};

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
const ReportsAPI = {

    getSalesReport: async () => {
        return await makeRequest(ENDPOINTS.reports.getSalesReport, {
            method: 'GET'
        });
    }
};

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
window.API = {
    products: ProductsAPI,
    sales: SalesAPI,
    reports: ReportsAPI
};