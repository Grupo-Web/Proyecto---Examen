
const productSelect = document.getElementById('product-select');
const quantityInput = document.getElementById('quantity-input');
const addItemBtn = document.getElementById('add-item-btn');
const saleItemsBody = document.getElementById('sale-items-body');
const subtotalValue = document.getElementById('subtotal-value');
const totalValue = document.getElementById('total-value');
const registerSaleBtn = document.getElementById('register-sale-btn');
const clearSaleBtn = document.getElementById('clear-sale-btn');

// Almacena los items del carrito
let cartItems = [];

// Almacena los productos disponibles
let availableProducts = [];

// LOCAL STORAGE - Carrito persistente en el navegador
const saveCartToStorage = () => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
};

const loadCartFromStorage = () => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
        cartItems = JSON.parse(storedCart);
        renderCartTable();
        updateTotals();
    }
};

// Cargar productos desde la API y llenar el selector
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
        availableProducts = result.data;
        populateProductSelect(result.data);
    } catch (error) {
        console.error("Error al cargar productos:", error);
        alert("Error al cargar productos: " + error.message);
    }
};

// Llenar el selector de productos
const populateProductSelect = (products) => {
    productSelect.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - $${product.price.toFixed(2)} (Stock: ${product.stock})`;
        option.dataset.price = product.price;
        option.dataset.stock = product.stock;
        productSelect.appendChild(option);
    });
};

// Agregar producto al carrito
const addItemToCart = () => {
    const productId = productSelect.value;
    const quantity = parseInt(quantityInput.value);

    if (!productId) {
        alert('Por favor selecciona un producto');
        return;
    }

    if (!quantity || quantity <= 0) {
        alert('La cantidad debe ser mayor a 0');
        return;
    }

    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const productPrice = parseFloat(selectedOption.dataset.price);
    const productStock = parseInt(selectedOption.dataset.stock);
    const productName = selectedOption.textContent.split(' - ')[0];

    if (quantity > productStock) {
        alert(`Stock insuficiente. Disponible: ${productStock}`);
        return;
    }

    const existingItemIndex = cartItems.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
        const newQuantity = cartItems[existingItemIndex].quantity + quantity;
        if (newQuantity > productStock) {
            alert(`Stock insuficiente. Disponible: ${productStock}, ya tienes ${cartItems[existingItemIndex].quantity} en el carrito`);
            return;
        }
        cartItems[existingItemIndex].quantity = newQuantity;
        cartItems[existingItemIndex].subtotal = productPrice * newQuantity;
    } else {
        cartItems.push({
            productId,
            productName,
            price: productPrice,
            quantity,
            subtotal: productPrice * quantity,
            stock: productStock
        });
    }

    renderCartTable();
    updateTotals();
    saveCartToStorage();

    quantityInput.value = '';
    productSelect.value = '';
};

// Renderizar la tabla del carrito
const renderCartTable = () => {
    saleItemsBody.innerHTML = '';

    if (cartItems.length === 0) {
        saleItemsBody.innerHTML = '<tr><td colspan="5" class="empty-message">No hay productos en el carrito</td></tr>';
        registerSaleBtn.disabled = true;
        return;
    }

    registerSaleBtn.disabled = false;

    cartItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.productName}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>$${item.subtotal.toFixed(2)}</td>
            <td>
                <button class="action-btn btn-delete" data-index="${index}">Eliminar</button>
            </td>
        `;
        saleItemsBody.appendChild(row);
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (confirm("¿Eliminar producto del carrito?")) {
                removeItemFromCart(index);
            }
        });
    });
};

// Eliminar producto del carrito
const removeItemFromCart = (index) => {
    cartItems.splice(index, 1);
    renderCartTable();
    updateTotals();
    saveCartToStorage();
};

// Calcular y actualizar subtotal y total
const updateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal;
    subtotalValue.textContent = `$${subtotal.toFixed(2)}`;
    totalValue.textContent = `$${total.toFixed(2)}`;
};

// Registrar venta usando API
const registerSale = async () => {
    if (cartItems.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const saleData = {
        items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };

    try {
        console.log('📤 Registrando venta...', saleData);
        registerSaleBtn.disabled = true;
        registerSaleBtn.textContent = 'Registrando...';

        const result = await API.sales.create(saleData);

        if (!result.success) {
            console.error('Error en respuesta:', result.error);
            alert('Error al registrar la venta: ' + result.error);
            registerSaleBtn.disabled = false;
            registerSaleBtn.textContent = 'Registrar Venta';
            return;
        }

        console.log('✅ Venta registrada exitosamente:', result.data);
        alert('Venta registrada exitosamente');
        clearSale();
        
    } catch (error) {
        console.error("Error al registrar venta:", error);
        alert("Error al registrar venta: " + error.message);
        registerSaleBtn.disabled = false;
        registerSaleBtn.textContent = 'Registrar Venta';
    }
};

// Limpiar venta
const clearSale = () => {
    cartItems = [];
    productSelect.value = '';
    quantityInput.value = '';
    renderCartTable();
    updateTotals();
    registerSaleBtn.textContent = 'Registrar Venta';
    saveCartToStorage();
};

// Event Listeners
addItemBtn.addEventListener('click', addItemToCart);
registerSaleBtn.addEventListener('click', registerSale);
clearSaleBtn.addEventListener('click', clearSale);
quantityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addItemToCart();
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCartFromStorage();
});


