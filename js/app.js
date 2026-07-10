// === Demo Store — Cart Logic + Meta Pixel Events ===
const CART_KEY = 'demo_store_cart';

// --- Cart helpers ---
function getCart() { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
function updateCartBadge() {
  var count = getCart().reduce(function(s, i) { return s + i.qty; }, 0);
  document.querySelectorAll('#cart-count').forEach(function(el) { el.textContent = count; });
}

function addToCart(id, name, price, img) {
  var cart = getCart();
  var existing = cart.find(function(i) { return i.id === id; });
  if (existing) { existing.qty++; } else { cart.push({ id: id, name: name, price: parseFloat(price), img: img, qty: 1 }); }
  saveCart(cart);
}
function removeFromCart(id) { saveCart(getCart().filter(function(i) { return i.id !== id; })); }
function changeQty(id, delta) {
  var cart = getCart();
  var item = cart.find(function(i) { return i.id === id; });
  if (item) { item.qty = Math.max(1, item.qty + delta); }
  saveCart(cart);
}

// --- Product page: Add to Cart + Pixel AddToCart ---
document.querySelectorAll('.add-to-cart').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var card = btn.closest('.product-card');
    var id = card.dataset.id, name = card.dataset.name, price = card.dataset.price, img = card.dataset.img;
    addToCart(id, name, price, img);
    btn.textContent = '\u2713 Added';
    setTimeout(function() { btn.textContent = 'Add to Cart'; }, 1200);

    // --- Pixel: AddToCart ---
    if (typeof fbq === 'function') {
      fbq('track', 'AddToCart', {
        content_name: name,
        content_ids: [id],
        content_type: 'product',
        value: parseFloat(price),
        currency: 'USD'
      });
    }
  });
});

// --- Cart page rendering ---
function renderCart() {
  var cart = getCart();
  var container = document.getElementById('cart-items');
  var summary = document.getElementById('cart-summary');
  var empty = document.getElementById('empty-cart');
  if (!container) return;
  if (cart.length === 0) { empty.style.display = 'block'; summary.style.display = 'none'; container.innerHTML = ''; return; }
  empty.style.display = 'none'; summary.style.display = 'block';
  container.innerHTML = cart.map(function(item) {
    return '<div class="cart-item">' +
      '<img src="' + item.img + '" alt="' + item.name + '">' +
      '<div class="item-info"><strong>' + item.name + '</strong><br>$' + item.price.toFixed(2) + '</div>' +
      '<div class="item-qty">' +
        '<button onclick="changeQty(\'' + item.id + '\', -1); renderCart();">\u2212</button>' +
        '<span>' + item.qty + '</span>' +
        '<button onclick="changeQty(\'' + item.id + '\', 1); renderCart();">+</button>' +
      '</div>' +
      '<button class="btn" onclick="removeFromCart(\'' + item.id + '\'); renderCart();">\u2715</button>' +
    '</div>';
  }).join('');
  var total = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  document.getElementById('cart-total').textContent = total.toFixed(2);
}

// --- Checkout summary rendering ---
function renderCheckoutSummary() {
  var cart = getCart();
  var container = document.getElementById('checkout-items');
  if (!container) return;
  container.innerHTML = cart.map(function(i) { return '<p>' + i.name + ' x ' + i.qty + ' — $' + (i.price * i.qty).toFixed(2) + '</p>'; }).join('');
  var total = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
  document.getElementById('checkout-total').textContent = total.toFixed(2);
}

// --- Checkout form submission ---
var form = document.getElementById('checkout-form');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var cart = getCart();
    var total = cart.reduce(function(s, i) { return s + i.price * i.qty; }, 0);
    var ids = cart.map(function(i) { return i.id; });
    var numItems = cart.reduce(function(s, i) { return s + i.qty; }, 0);
    var data = { name: form.name.value, email: form.email.value, address: form.address.value, items: cart };

    var SERVER_URL = window.DEMO_SERVER_URL || 'https://pixelM.onrender.com/';
    fetch(SERVER_URL + '/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    })
    .then(function(res) { return res.json(); })
    .then(function(result) {
      localStorage.removeItem(CART_KEY);
      window.location.href = 'thank-you.html?order=' + result.orderId + '&value=' + total.toFixed(2) + '&ids=' + ids.join(',') + '&num_items=' + numItems;
    })
    .catch(function() {
      // Fallback if server is down
      localStorage.removeItem(CART_KEY);
      window.location.href = 'thank-you.html?order=ORD-' + Date.now() + '&value=' + total.toFixed(2) + '&ids=' + ids.join(',') + '&num_items=' + numItems;
    });
  });
}

// Init badge on every page
updateCartBadge();
