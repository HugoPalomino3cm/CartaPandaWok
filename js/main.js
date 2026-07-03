// Lógica de visualización de apartados
function mostrarCarta() {
    document.getElementById('seccion-enlaces').classList.add('seccion-oculta');
    document.getElementById('seccion-carta').classList.remove('seccion-oculta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarEnlaces() {
    document.getElementById('seccion-carta').classList.add('seccion-oculta');
    document.getElementById('seccion-enlaces').classList.remove('seccion-oculta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================================
// Conexión con Google Sheets
// =========================================

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTyVpfPrVQwyaZmgPACch4JR2xApt67ZXPOhGmKGCPpkIUHkWKIivloaluxTC9o9RyVJ1bGw2eRZy2j/pub?output=csv';

document.addEventListener("DOMContentLoaded", () => {
    cargarProductosDesdeExcel();
    configurarBotonWokEstatico();
});

function cargarProductosDesdeExcel() {
    Papa.parse(SHEET_CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            renderizarMenu(results.data);
        }
    });
}

function renderizarMenu(productos) {
    const gridEspecialidades = document.getElementById('grid-especialidades');
    const gridBebidas = document.getElementById('grid-bebidas');
    const gridExtras = document.getElementById('grid-extras');

    productos.forEach(prod => {
        // Saltar filas vacías
        if (!prod.Nombre || !prod.Precio) return;

        const precioNum = parseInt(prod.Precio);
        const precioFormateado = precioNum.toLocaleString('es-CL');

        const cardHTML = `
            <div class="menu-card">
                <img src="${prod.Imagen}" alt="${prod.Nombre}" class="card-img">
                <div class="card-overlay">
                    <button class="add-btn-floating dynamic-add-btn" onclick="addToCart('${prod.Nombre}', ${precioNum})">+</button>
                    <h4 class="card-item-title">${prod.Nombre}</h4>
                    <p class="card-item-desc">${prod.Descripcion}</p>
                    <span class="card-item-price">$${precioFormateado}</span>
                </div>
            </div>
        `;

        // Clasificar en su contenedor correspondiente
        const categoria = prod.Categoria.trim().toUpperCase();
        if (categoria === 'ESPECIALIDADES') gridEspecialidades.innerHTML += cardHTML;
        if (categoria === 'BEBIDAS') gridBebidas.innerHTML += cardHTML;
        if (categoria === 'EXTRAS') gridExtras.innerHTML += cardHTML;
    });
}

function configurarBotonWokEstatico() {
    const wokBtn = document.querySelector('.wok-add-btn');
    if (wokBtn) {
        wokBtn.addEventListener('click', (e) => {
            // Capturar lo que el cliente eligió
            const carbo = document.getElementById('wok-carbo').value;
            const salsa = document.getElementById('wok-salsa').value;
            const proteina = document.getElementById('wok-proteina').value;

            // Validar que no falte nada
            if (!carbo || !salsa || !proteina) {
                alert("¡Oye! Faltan ingredientes. Por favor elige tu carbohidrato, salsa y proteína antes de armar el wok.");
                return; // Detiene la ejecución si falta algo
            }

            // Construir el nombre dinámico del producto
            const name = `Wok Personalizado (${carbo} + ${salsa} + ${proteina})`;

            const container = e.target.closest('.wok-card-main');
            const priceStr = container.querySelector('.wok-main-price').innerText;
            const price = parseInt(priceStr.replace('$', '').replace('.', ''));

            addToCart(name, price);

            // Opcional: Reiniciar los selectores después de agregarlo al carrito
            document.getElementById('wok-carbo').value = "";
            document.getElementById('wok-salsa').value = "";
            document.getElementById('wok-proteina').value = "";
        });
    }
}

// =========================================
// Lógica del Carrito de Compras
// =========================================

let cart = [];
// REEMPLAZAR AQUÍ: Coloca el número de WhatsApp del local (Ej: 56912345678)
const telefonoLocal = "56987841962";

function addToCart(name, price) {
    cart.push({ name: name, price: price });
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const countSpan = document.getElementById('cart-count');
    const itemsContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total-price');
    const floatBtn = document.getElementById('cart-float-btn');

    countSpan.innerText = cart.length;

    if (cart.length > 0) {
        floatBtn.classList.remove('seccion-oculta');
    } else {
        floatBtn.classList.add('seccion-oculta');
        document.getElementById('cart-modal').classList.add('seccion-oculta');
    }

    itemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        itemsContainer.innerHTML += `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>$${item.price.toLocaleString('es-CL')}</span>
                <button onclick="removeFromCart(${index})" class="remove-btn">Eliminar</button>
            </div>
        `;
    });

    totalSpan.innerText = total.toLocaleString('es-CL');
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (cart.length > 0) {
        modal.classList.toggle('seccion-oculta');
    }
}

function sendWhatsApp() {
    if (cart.length === 0) return;

    let text = "Hola Wok Placeres, quiero hacer el siguiente pedido:%0A%0A";
    let total = 0;

    cart.forEach(item => {
        text += `- 1x ${item.name} ($${item.price.toLocaleString('es-CL')})%0A`;
        total += item.price;
    });

    text += `%0ATotal a pagar: $${total.toLocaleString('es-CL')}%0A%0AQuedo atento.`;

    const url = `https://wa.me/${telefonoLocal}?text=${text}`;
    window.open(url, '_blank');
}
