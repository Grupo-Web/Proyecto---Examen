
const productForm = document.getElementById('product-form');
const productsBody = document.getElementById('products-body');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');

let isEditing = false;
let currentProductId = null;

const loadProducts = async () => {
    try {
        console.log('📥 Cargando productos...');
        const result = await API.products.getAll();
        
        if (!result.success) {
            console.error('Error en respuesta:', result.error);
            alert('Error al cargar productos: ' + result.error);
            return;
        }
        
        console.log('✅ Productos obtenidos:', result.data);
        renderTable(result.data);
    } catch (error) {
        console.error("Error al cargar productos:", error);
        alert("Error al cargar productos: " + error.message);
    }
};

const renderTable = (products) => {
    productsBody.innerHTML = ''; // Limpiar tabla
    
    if (!products || products.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align:center;">No hay productos</td>';
        productsBody.appendChild(row);
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>
                <button onclick="prepareEdit('${product.id}', '${product.name}', '${product.description}', '${product.category}', ${product.price}, ${product.stock})">Editar</button>
                <button onclick="deleteProduct('${product.id}')">Eliminar</button>
            </td>
        `;
        productsBody.appendChild(row);
    });
};

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productData = {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        createdAt: new Date()
    };

    if (!productData.name) {
        alert('El nombre es obligatorio');
        return;
    }

    if (productData.price <= 0) {
        alert('El precio debe ser mayor a 0');
        return;
    }

    if (productData.stock < 0) {
        alert('El stock no puede ser negativo');
        return;
    }

    try {
        if (isEditing && currentProductId) {
            console.log('📝 Actualizando producto:', currentProductId);
            const result = await API.products.update(currentProductId, productData);
            
            if (result.success) {
                alert("✅ Producto actualizado correctamente");
            } else {
                alert("❌ Error al actualizar: " + result.error);
                return;
            }
        } else {
            console.log('➕ Creando nuevo producto');
            const result = await API.products.create(productData);
            
            if (result.success) {
                alert("✅ Producto creado correctamente");
            } else {
                alert("❌ Error al crear: " + result.error);
                return;
            }
        }
        
        resetForm();
        loadProducts();
    } catch (error) {
        console.error('Error:', error);
        alert("❌ Error al procesar la solicitud: " + error.message);
    }
});

const deleteProduct = async (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        try {
            console.log('🗑️  Eliminando producto:', id);
            const result = await API.products.delete(id);
            
            if (result.success) {
                alert("✅ Producto eliminado correctamente");
                loadProducts();
            } else {
                alert("❌ Error al eliminar: " + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert("❌ Error al eliminar: " + error.message);
        }
    }
};

window.prepareEdit = (id, name, description, category, price, stock) => {
    isEditing = true;
    currentProductId = id;
    document.getElementById('product-id').value = id;
    document.getElementById('name').value = name;
    document.getElementById('description').value = description;
    document.getElementById('category').value = category;
    document.getElementById('price').value = price;
    document.getElementById('stock').value = stock;
    
    document.getElementById('form-title').textContent = 'Editar Producto';
    btnSave.textContent = "Actualizar Producto";
    btnCancel.style.display = "inline-block";
    
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
};

const resetForm = () => {
    isEditing = false;
    currentProductId = null;
    productForm.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-title').textContent = 'Agregar Nuevo Producto';
    btnSave.textContent = "Guardar Producto";
    btnCancel.style.display = "none";
};

btnCancel.addEventListener('click', resetForm);

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Página de productos inicializada');
    loadProducts();
});