// Referencias a elementos del DOM
const productForm = document.getElementById('product-form');
const productsBody = document.getElementById('products-body');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');

// Variables de estado
let isEditing = false;

// 1. Función para LISTAR (Obtener productos de la API)
const loadProducts = async () => {
    try {
        // Aquí usamos el objeto 'api' que debería estar definido en api.js
        const products = await api.get('/products'); 
        renderTable(products);
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
};

// 2. Función para RENDERIZAR la tabla
const renderTable = (products) => {
    productsBody.innerHTML = ''; // Limpiar tabla
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price}</td>
            <td>${product.stock}</td>
            <td>
                <button onclick="prepareEdit('${product.id}', '${product.name}', ${product.price}, ${product.stock})">Editar</button>
                <button onclick="deleteProduct('${product.id}')">Eliminar</button>
            </td>
        `;
        productsBody.appendChild(row);
    });
};

// 3. Función para GUARDAR o EDITAR
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value, // NUEVO
        category: document.getElementById('category').value,       // NUEVO
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        createdAt: new Date() // El repositorio pide una fecha
    };

    const id = document.getElementById('product-id').value;

    try {
        if (isEditing) {
            await api.put(`/products/${id}`, productData);
            alert("Producto actualizado");
        } else {
            await api.post('/products', productData);
            alert("Producto creado");
        }
        resetForm();
        loadProducts();
    } catch (error) {
        alert("Error al procesar la solicitud");
    }
});

// 4. Función para ELIMINAR
const deleteProduct = async (id) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        await api.delete(`/products/${id}`);
        loadProducts();
    }
};

// 5. Preparar el formulario para EDITAR
window.prepareEdit = (id, name, price, stock) => {
    isEditing = true;
    document.getElementById('product-id').value = id;
    document.getElementById('name').value = name;
    document.getElementById('price').value = price;
    document.getElementById('stock').value = stock;
    
    btnSave.textContent = "Actualizar Producto";
    btnCancel.style.display = "inline";
};

// 6. Resetear formulario
const resetForm = () => {
    isEditing = false;
    productForm.reset();
    document.getElementById('product-id').value = '';
    btnSave.textContent = "Guardar Producto";
    btnCancel.style.display = "none";
};

btnCancel.addEventListener('click', resetForm);

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', loadProducts);