// Cart array to store items
let cart = [];

// Load cart from local storage when page loads
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Save cart to local storage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count display
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Add product to cart
function addToCart(productName, productPrice) {
    const product = {
        id: Date.now(),
        name: productName,
        price: productPrice,
        quantity: 1
    };
    
    cart.push(product);
    saveCart();
    updateCartCount();
    
    // Show notification
    showNotification(`${productName} added to cart!`);
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    displayCart();
}

// Display cart items
function displayCart() {
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal) return;
    
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }
    
    let total = 0;
    let html = '<table class="cart-table"><tr><th>Product</th><th>Price</th><th>Action</th></tr>';
    
    cart.forEach(item => {
        html += `
            <tr>
                <td>${item.name}</td>
                <td>₹${item.price}</td>
                <td><button onclick="removeFromCart(${item.id})" class="remove-btn">Remove</button></td>
            </tr>
        `;
        total += item.price;
    });
    
    html += '</table>';
    html += `<div class="cart-total"><strong>Total: ₹${total}</strong></div>`;
    
    cartItemsContainer.innerHTML = html;
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 2 seconds
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Toggle cart modal
function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.toggle('open');
        if (cartModal.classList.contains('open')) {
            displayCart();
        }
    }
}

// Close cart modal when clicking outside
function closeCartModal(event) {
    const cartModal = document.getElementById('cart-modal');
    const cartIcon = document.getElementById('cart-icon');
    
    if (cartModal && cartModal.classList.contains('open') && event.target !== cartIcon && !cartIcon.contains(event.target) && !cartModal.contains(event.target)) {
        cartModal.classList.remove('open');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    // Ensure every product card has a usable add-to-cart button
    setupMissingAddToCartButtons();

    // Add click listeners to all "Add to Cart" buttons (static ones in HTML)
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // prevent opening product modal
            const productName  = this.getAttribute('data-product-name');
            const productPrice = parseInt(this.getAttribute('data-product-price'));
            addToCart(productName, productPrice);
        });
    });
    
    // Cart icon click listener
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', closeCartModal);

    // ── Product modal: click on any grid-item to open ──
    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't open modal if user clicked the Add-to-Cart button itself
            if (e.target.classList.contains('add-to-cart-btn')) return;
            openProductModal(item);
        });
    });

    // Close product modal via ✕ button
    document.getElementById('product-modal-close').addEventListener('click', closeProductModal);

    // Close product modal via backdrop overlay
    document.getElementById('product-modal-overlay').addEventListener('click', closeProductModal);

    // Escape key closes both modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
            const cartModal = document.getElementById('cart-modal');
            if (cartModal) cartModal.classList.remove('open');
        }
    });

    // Mobile menu: clone panel-ops into mobile menu and setup toggle
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const panelOps   = document.querySelector('.panel-ops');
    if (mobileMenu && panelOps) {
        mobileMenu.innerHTML = panelOps.innerHTML;
    }
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('open');
            mobileMenu.setAttribute('aria-hidden', !mobileMenu.classList.contains('open'));
        });

        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && e.target !== navToggle) {
                mobileMenu.classList.remove('open');
                mobileMenu.setAttribute('aria-hidden', 'true');
            }
        });

        mobileMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            mobileMenu.setAttribute('aria-hidden', 'true');
        });
    }
});

// ── Product Modal Helpers ──────────────────────────────

function openProductModal(item) {
    const img          = item.querySelector('img');
    const nameEl       = item.querySelector('span');
    const priceRaw     = parseInt(item.dataset.productPrice) || 0;
    const productName  = nameEl ? nameEl.textContent.trim() : (img ? img.alt : 'Product');

    // Populate modal fields
    document.getElementById('pm-img').src      = img ? img.src : '';
    document.getElementById('pm-img').alt      = productName;
    document.getElementById('pm-name').textContent  = productName;
    document.getElementById('pm-price').textContent = '₹' + priceRaw.toLocaleString('en-IN');

    // Delivery date = today + 2 days
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 2);
    document.getElementById('pm-delivery-date').textContent = delivery.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long'
    });

    // Reset qty
    document.getElementById('pm-qty').value = '1';

    // "Add to Cart" inside modal
    const addBtn = document.getElementById('pm-add-cart');
    const buyBtn = document.getElementById('pm-buy-now');

    // Remove old listeners by cloning
    const newAddBtn = addBtn.cloneNode(true);
    const newBuyBtn = buyBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAddBtn, addBtn);
    buyBtn.parentNode.replaceChild(newBuyBtn, buyBtn);

    newAddBtn.addEventListener('click', function() {
        const qty = parseInt(document.getElementById('pm-qty').value) || 1;
        for (let i = 0; i < qty; i++) addToCart(productName, priceRaw);
        closeProductModal();
    });

    newBuyBtn.addEventListener('click', function() {
        const qty = parseInt(document.getElementById('pm-qty').value) || 1;
        for (let i = 0; i < qty; i++) addToCart(productName, priceRaw);
        closeProductModal();
        // Open cart so user sees it immediately
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.classList.add('open');
            displayCart();
        }
    });

    // Show modal
    const modal = document.getElementById('product-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// ── Price inference (fallback) ────────────────────────
function inferProductPrice(productName) {
    const name = productName.toLowerCase();
    if (/galaxy|s26|s25|fold|ultra|macbook|lenovo|asus|mackbook|laptop|oneplus/i.test(name)) return 2499;
    if (/nike|air|max|running|shoe|winflo/i.test(name)) return 3999;
    if (/rockerz|headphones|buds|earbuds/i.test(name)) return 1499;
    if (/garnier|facewash|cetaphil|nivea|mama-earth|soup/i.test(name)) return 299;
    return 799;
}

function setupMissingAddToCartButtons() {
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        const img = item.querySelector('img');
        const label = item.querySelector('span');
        const productName = (label?.textContent.trim() || img?.alt || 'Product').trim();
        const price = item.dataset.productPrice ? parseInt(item.dataset.productPrice) : inferProductPrice(productName);

        if (img && (!img.alt || img.alt === '')) {
            img.alt = productName;
        }

        // Only add price tag if not already present in HTML
        if (!item.querySelector('.product-price')) {
            const priceTag = document.createElement('div');
            priceTag.className = 'product-price';
            priceTag.textContent = `₹${price.toLocaleString('en-IN')}`;
            item.appendChild(priceTag);
        }

        // Only add button if not already present in HTML
        if (!item.querySelector('.add-to-cart-btn')) {
            const button = document.createElement('button');
            button.className = 'add-to-cart-btn';
            button.type = 'button';
            button.textContent = 'Add to Cart';
            button.dataset.productName = productName;
            button.dataset.productPrice = price;
            item.appendChild(button);
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                addToCart(productName, price);
            });
        }
    });
}

