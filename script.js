// ====== Helper Selectors ======
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ====== DOM Elements ======
const addToCartBtns = $$('.empty-cart-box');
const addToCart = $$('.empty-cart-text');
const cartStatus = $('.cart-status');
const cart = $('.cart');
const names = $$('.product-name');
const prices = $$('.product-price');
const categories = $$('.product-category');
const images = $$('.img-card img'); // for image border
const cartQuantityEl = document.querySelector('.cart .quantity');

let cartItems = [];

// ====== Add to Cart ======
// ====== Add to Cart ======
addToCart.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    const name = names[i].getAttribute('name');
    const price = Number(prices[i].getAttribute('price'));
    const category = categories[i].getAttribute('category');
    const productImg = images[i];
    let existing = cartItems.find(item => item.name === name);

    if (existing) {
      existing.quantity++;
    } else {
      existing = { name, price, category, quantity: 1 };
      cartItems.push(existing);
      showToast(`${name} added to cart.`);
    }

    // Add red border to image
    productImg.classList.add('selected-cart');

    // Change current button to quantity control view
    const currentBtn = addToCartBtns[i];
    currentBtn.classList.add('selected-cart');
    currentBtn.innerHTML = `
      <div class="cart-decrease"><img src="assets/images/icon-decrement-quantity.svg" alt="-" ></div>
      <p class="empty-cart-text selected-cart">${existing.quantity}</p>
      <div class="cart-increase"><img src="assets/images/icon-increment-quantity.svg" alt="+" ></div>
    `;

    // Attach increment/decrement
    const increaseBtn = currentBtn.querySelector('.cart-increase');
    const decreaseBtn = currentBtn.querySelector('.cart-decrease');
    const quantityText = currentBtn.querySelector('.empty-cart-text');

    // === Increase Button ===
    increaseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      existing.quantity++;
      quantityText.textContent = existing.quantity;
      updateCart();
    });

    // === Decrease Button ===
    decreaseBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (existing.quantity > 1) {
        existing.quantity--;
        quantityText.textContent = existing.quantity;
      } else {
        // Remove item completely
        cartItems = cartItems.filter(item => item.name !== name);

        // Reset button to default Add to Cart state
        currentBtn.classList.remove('selected-cart');
        currentBtn.innerHTML = `
          <img src="assets/images/icon-add-to-cart.svg" alt="" class="empty-cart-img" />
          <p class="empty-cart-text">Add to Cart</p>
        `;
        productImg.classList.remove('selected-cart'); // remove red border

        // Re-attach Add to Cart event listener so it works again
        const newAddBtn = currentBtn.querySelector('.empty-cart-text');
        newAddBtn.addEventListener('click', () => {
          btn.click(); 
        });
      }

      updateCart();
    });

    updateCart();
  });
});


// ====== Update Cart ======
function updateCart() {
  cartStatus.innerHTML = ''; // clear old items

  const oldSummary = cart.querySelector('.cart-summary');
  if (oldSummary) oldSummary.remove();

  if (cartItems.length === 0) {
    cartStatus.innerHTML = `
      <img src="assets/images/illustration-empty-cart.svg" alt="">
      <p class="empty-text">Your cart is empty.</p>`;
    if (cartQuantityEl) cartQuantityEl.textContent = `(0)`;
    return;
  }

  let total = 0;
  let totalQuantity = 0;

  cartItems.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    totalQuantity += item.quantity;

    const itemHTML = `
      <div class="cart-status order-items">
        <div class="order-item-box">
          <h1>${item.name}</h1>
          <div class="order-item-status">
            <p class="item-quantity">${item.quantity}x</p>
            <p class="item-price">$${item.price.toFixed(2)}</p>
            <p class="item-amount">$${itemTotal.toFixed(2)}</p>
          </div>
        </div>
        <div class="remove-item-button">
          <img src="assets/images/icon-remove-item.svg" alt="Remove" data-index="${i}">
        </div>
      </div>`;
    cartStatus.insertAdjacentHTML('beforeend', itemHTML);
  });

  cart.insertAdjacentHTML('beforeend', `
    <div class="cart-summary">
      <div class="total">
        <div class="total-order">Order Total</div>
        <div class="total-price">$${total.toFixed(2)}</div>
      </div>
      <div class="carbon-neutral">
        <img src="assets/images/icon-carbon-neutral.svg" alt="">
        <div>This is a <span>carbon-neutral</span> delivery</div>
      </div>
      <button class="confirm-order-btn">Confirm Order</button>
    </div>
  `);

  if (cartQuantityEl) cartQuantityEl.textContent = `(${totalQuantity})`;

  attachRemoveListeners();
  attachConfirmListener(total);
}

// ====== Remove Item ======
function attachRemoveListeners() {
  $$(".remove-item-button img").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const removedItem = cartItems[index];
      const imgIndex = Array.from(names).findIndex(n => n.getAttribute('name') === removedItem.name);

      if (imgIndex !== -1) {
        // Remove red border from image
        images[imgIndex].classList.remove('selected-cart');
        // Reset button view
        addToCartBtns[imgIndex].classList.remove('selected-cart');
        addToCartBtns[imgIndex].innerHTML = `
          <img src="assets/images/icon-add-to-cart.svg" alt="" class="empty-cart-img" />
          <p class="empty-cart-text">Add to Cart</p>
        `;
      }

      cartItems.splice(index, 1);
      updateCart();
    });
  });
}

// ====== Confirm Order ======
function attachConfirmListener(total) {
  const confirmBtn = $('.confirm-order-btn');
  if (!confirmBtn) return;
  confirmBtn.addEventListener('click', () => {
    orderPopUp(total);
  });
}

// ====== Order Confirmation Popup ======
function orderPopUp(total) {
  const existingPopup = $('.order-confirmation-alert');
  if (existingPopup) existingPopup.remove();

  const orderConfirmationBox = document.createElement('div');
  orderConfirmationBox.className = 'order-confirmation-alert';
  document.body.appendChild(orderConfirmationBox);

  let confirmedItemsHTML = '';
  cartItems.forEach(item => {
    const itemTotal = item.price * item.quantity;
    confirmedItemsHTML += `
      <div class="items-confirmed">
        <div class="order-item-box">
          <div class="order-thumbnail">
            <img src="assets/images/image-${item.category}-thumbnail.jpg" alt="${item.name}">
          </div>
          <div class="order-items-details">
            <div class="item-name">${item.name}</div>
            <div class="order-item-status item-info">
              <div class="num-of-items item-quantity">${item.quantity}x</div>
              <div class="price-of-items item-price">@$${item.price.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div class="amount-of-items">$${itemTotal.toFixed(2)}</div>
      </div>`;
  });

  orderConfirmationBox.innerHTML = `
    <div class="order-confirmation-box">
      <div class="confirmation-heading">
        <div class="image-order">
          <img src="assets/images/icon-order-confirmed.svg" alt="">
        </div>
        <h1>Order Confirmed</h1>
        <p>We hope you enjoy the food!</p>
      </div>
      <div class="confirmation-items-box">
        ${confirmedItemsHTML}
        <div class="total">
          <div class="total-order">Order Total</div>
          <div class="total-price">$${total.toFixed(2)}</div>
        </div>
      </div>
      <button class="new-order-btn">Start New Order</button>
    </div>
  `;

  orderConfirmationBox.addEventListener('click', (e) => {
    if (e.target === orderConfirmationBox) orderConfirmationBox.remove();
  });

  orderConfirmationBox.querySelector('.new-order-btn').addEventListener('click', () => {
    cartItems = [];
    addToCartBtns.forEach((btn, i) => {
      btn.classList.remove('selected-cart');
      btn.innerHTML = `
        <img src="assets/images/icon-add-to-cart.svg" alt="" class="empty-cart-img" />
        <p class="empty-cart-text">Add to Cart</p>
      `;
      images[i].classList.remove('selected-cart'); // remove border
    });
    updateCart();
    orderConfirmationBox.remove();
  });
}

// ====== Toast helper - creates container if missing and shows toasts ======
function ensureToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}


  // showToast(message)

function showToast(message,) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';

  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  const DISPLAY = 1000; 
  setTimeout(() => {
    toast.classList.remove('show');
   
    setTimeout(() => toast.remove(), 300);
  }, DISPLAY);
}



function updateProductImages() {
  const images = document.querySelectorAll('.img-card img');

  images.forEach((img) => {
    const desktopSrc = img.getAttribute('src');
    const tabletSrc = desktopSrc.replace('-desktop', '-tablet'); 
    const mobileSrc = desktopSrc.replace('-desktop', '-mobile');
    if (window.innerWidth <=770) {
      img.setAttribute('src', tabletSrc);
    } else if(window.innerWidth <=500) {
      img.setAttribute('src', mobileSrc);
    }else {
      img.setAttribute('scr', desktopSrc);
    }
  });
}

// Run on load and resize
window.addEventListener('load', updateProductImages);
window.addEventListener('resize', updateProductImages);
