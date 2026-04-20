(function() {
    "use strict";

    // ---------- SELECTORS ----------
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const slides = document.querySelectorAll('.slide');
    const cartToggle = document.querySelector('.cart-fab');
    const cartModal = document.querySelector('.modal');
    const closeModal = document.querySelector('.close-modal');
    const cartCountBadge = document.querySelector('.cart-badge');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotalSpan = document.getElementById('cartTotal');
    const checkoutForm = document.getElementById('checkoutForm');

    // ---------- MOBILE MENU ----------
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });
    }

    // ---------- HERO SLIDER ----------
    let currentSlide = 0;
    const slideInterval = 6000;

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 0) {
        setInterval(nextSlide, slideInterval);
    }

    // ---------- CART SYSTEM ----------
    let cart = JSON.parse(localStorage.getItem('nzuzaCart')) || [];

    function updateCartUI() {
        if (!cartCountBadge) return;
        
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountBadge.textContent = totalItems;

        if (cartItemsList) {
            if (cart.length === 0) {
                cartItemsList.innerHTML = '<p style="text-align:center; padding: 2rem 0;">Your cart is empty.</p>';
                cartTotalSpan.textContent = 'R 0';
            } else {
                let html = '';
                let total = 0;
                cart.forEach((item, index) => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    html += `
                        <div class="cart-item">
                            <div>
                                <h4 style="margin:0; font-size:1.1rem;">${item.name}</h4>
                                <p style="margin:0; font-size:0.9rem; color:#666;">R ${item.price.toLocaleString()} x ${item.quantity}</p>
                            </div>
                            <div style="display:flex; align-items:center; gap: 15px;">
                                <span style="font-weight:700;">R ${itemTotal.toLocaleString()}</span>
                                <i class="fas fa-trash-alt" style="color:#C9A14A; cursor:pointer;" data-remove="${index}"></i>
                            </div>
                        </div>
                    `;
                });
                cartItemsList.innerHTML = html;
                cartTotalSpan.textContent = `R ${total.toLocaleString()}`;

                // Add removal listeners
                document.querySelectorAll('[data-remove]').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = e.target.getAttribute('data-remove');
                        cart.splice(idx, 1);
                        saveCart();
                        updateCartUI();
                    });
                });
            }
        }
    }

    function saveCart() {
        localStorage.setItem('nzuzaCart', JSON.stringify(cart));
    }

    function addToCart(service) {
        const existing = cart.find(item => item.id === service.id);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ ...service, quantity: 1 });
        }
        saveCart();
        updateCartUI();
        
        // Notification feedback
        const btn = document.querySelector(`[data-id="${service.id}"]`);
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Added';
            btn.classList.add('btn-primary');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-primary');
            }, 1500);
        }
    }

    // Event listener for "Add to Cart" buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const service = {
                id: e.target.dataset.id,
                name: e.target.dataset.name,
                price: parseFloat(e.target.dataset.price)
            };
            addToCart(service);
        }
    });

    // Modal toggle
    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            cartModal.classList.add('active');
            updateCartUI();
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            cartModal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });

    // ---------- CHECKOUT LOGIC ----------
    function getOrderSummary() {
        if (cart.length === 0) return "";
        let summary = "Order Inquiry for Legal Services:\n\n";
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            summary += `- ${item.name} (x${item.quantity}): R ${itemTotal.toLocaleString()}\n`;
            total += itemTotal;
        });
        summary += `\nTotal Estimate: R ${total.toLocaleString()}\n\n`;
        
        const name = document.getElementById('customerName').value;
        const email = document.getElementById('customerEmail').value;
        const phone = document.getElementById('customerPhone').value;
        
        summary += `Client Details:\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`;
        return summary;
    }

    document.getElementById('whatsappCheckout')?.addEventListener('click', () => {
        const name = document.getElementById('customerName').value;
        const email = document.getElementById('customerEmail').value;
        const phone = document.getElementById('customerPhone').value;

        if (!name || !email || !phone) {
            alert('Please fill in all details.');
            return;
        }

        const msg = encodeURIComponent(getOrderSummary());
        window.open(`https://wa.me/27796017408?text=${msg}`, '_blank');
    });

    document.getElementById('emailCheckout')?.addEventListener('click', () => {
        const name = document.getElementById('customerName').value;
        const email = document.getElementById('customerEmail').value;
        const phone = document.getElementById('customerPhone').value;

        if (!name || !email || !phone) {
            alert('Please fill in all details.');
            return;
        }

        const subject = encodeURIComponent(`Legal Service Inquiry - ${name}`);
        const body = encodeURIComponent(getOrderSummary());
        window.location.href = `mailto:info@nzuzaattorneys.co.za?subject=${subject}&body=${body}`;
    });

    // ---------- SCROLL REVEAL ----------
    const revealElements = document.querySelectorAll('[data-reveal]');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.9;
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('revealed');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Initial UI Update
    updateCartUI();

})();
