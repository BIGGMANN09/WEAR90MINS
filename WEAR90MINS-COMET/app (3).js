(function () {
  "use strict";
  var WHATSAPP_NUMBER = "233505389974";
  var STORE_KEY = "wear90mins.cart.v1";
  var products = window.WEAR90_PRODUCTS || [];
  var state = { query: "", collection: "", sort: "featured", cart: {} };
  var cartButton = document.getElementById("cartButton");
  var cartDrawer = document.getElementById("cartDrawer");
  var backdrop = document.getElementById("drawerBackdrop");
  var closeCart = document.getElementById("closeCart");
  var cartItems = document.getElementById("cartItems");
  var cartTotal = document.getElementById("cartTotal");
  var cartCount = document.getElementById("cartCount");
  var whatsappOrder = document.getElementById("whatsappOrder");
  var searchInput = document.getElementById("search");
  var collectionSelect = document.getElementById("collection");
  var sortSelect = document.getElementById("sort");
  var resetButton = document.getElementById("resetFilters");
  var emptyReset = document.getElementById("emptyReset");
  var productGrid = document.getElementById("productGrid");
  var emptyState = document.getElementById("emptyState");
  var resultCount = document.getElementById("resultCount");
  var lastFocused = null;

  function safeGet() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
    catch (error) { return {}; }
  }
  function safeSet(value) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(value)); }
    catch (error) {}
  }
  function formatMoney(amount) {
    return "GH₵" + amount.toFixed(2);
  }
  function productById(id) {
    for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i];
    return null;
  }
  function collections() {
    var seen = {};
    var list = [];
    products.forEach(function (product) {
      if (!seen[product.collection]) { seen[product.collection] = true; list.push(product.collection); }
    });
    return list.sort();
  }
  function populateCollections() {
    if (!collectionSelect) return;
    collections().forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      collectionSelect.appendChild(option);
    });
  }
  function filteredProducts() {
    var query = state.query.trim().toLowerCase();
    var list = products.filter(function (product) {
      var matchesQuery = !query || (product.name + " " + product.collection).toLowerCase().indexOf(query) !== -1;
      var matchesCollection = !state.collection || product.collection === state.collection;
      return matchesQuery && matchesCollection;
    });
    if (state.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    if (state.sort === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return list;
  }
  function renderProducts() {
    if (!productGrid) return;
    productGrid.textContent = "";
    var list = filteredProducts();
    resultCount.textContent = list.length + (list.length === 1 ? " jersey" : " jerseys");
    emptyState.hidden = list.length !== 0;
    list.forEach(function (product) {
      var card = document.createElement("article");
      card.className = "product-card";
      var media = document.createElement("div");
      media.className = "product-media";
      var image = document.createElement("img");
      image.loading = "lazy";
      image.decoding = "async";
      image.src = product.photo;
      image.alt = product.alt;
      image.width = 800;
      image.height = 800;
      image.addEventListener("error", function () { if (product.fallback) image.src = product.fallback; });
      media.appendChild(image);
      if (product.soldOut) {
        var badge = document.createElement("p");
        badge.className = "badge";
        badge.textContent = "Sold out";
        media.appendChild(badge);
      }
      var body = document.createElement("div");
      body.className = "product-body";
      var collection = document.createElement("p");
      collection.className = "product-collection";
      collection.textContent = product.collection;
      var title = document.createElement("h3");
      title.textContent = product.name;
      var price = document.createElement("p");
      price.className = "price";
      price.textContent = formatMoney(product.price);
      body.appendChild(collection);
      body.appendChild(title);
      body.appendChild(price);
      var action = document.createElement("button");
      action.type = "button";
      action.className = product.soldOut ? "button disabled" : "button primary";
      action.textContent = product.soldOut ? "Sold out" : "Add to cart";
      action.disabled = product.soldOut;
      action.setAttribute("aria-label", product.soldOut ? product.name + " is sold out" : "Add " + product.name + " to cart");
      if (!product.soldOut) action.addEventListener("click", function () { addToCart(product.id); });
      body.appendChild(action);
      card.appendChild(media);
      card.appendChild(body);
      productGrid.appendChild(card);
    });
  }
  function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    safeSet(state.cart);
    renderCart();
    openDrawer();
  }
  function changeQuantity(id, change) {
    var next = (state.cart[id] || 0) + change;
    if (next <= 0) delete state.cart[id]; else state.cart[id] = next;
    safeSet(state.cart);
    renderCart();
  }
  function removeItem(id) {
    delete state.cart[id];
    safeSet(state.cart);
    renderCart();
  }
  function cartProducts() {
    return Object.keys(state.cart).map(productById).filter(Boolean);
  }
  function renderCart() {
    var items = cartProducts();
    var count = items.reduce(function (total, product) { return total + state.cart[product.id]; }, 0);
    var total = items.reduce(function (total, product) { return total + product.price * state.cart[product.id]; }, 0);
    cartCount.textContent = count;
    cartItems.textContent = "";
    if (!items.length) {
      var empty = document.createElement("p");
      empty.className = "empty-cart";
      empty.textContent = "Your cart is empty. Add a jersey to begin your order.";
      cartItems.appendChild(empty);
      whatsappOrder.setAttribute("aria-disabled", "true");
      whatsappOrder.classList.add("disabled");
      whatsappOrder.href = "https://wa.me/" + WHATSAPP_NUMBER;
    } else {
      whatsappOrder.removeAttribute("aria-disabled");
      whatsappOrder.classList.remove("disabled");
      items.forEach(function (product) {
        var row = document.createElement("div");
        row.className = "cart-row";
        var info = document.createElement("div");
        var name = document.createElement("p");
        name.className = "cart-name";
        name.textContent = product.name;
        var line = document.createElement("p");
        line.className = "cart-line";
        line.textContent = formatMoney(product.price) + " each";
        info.appendChild(name);
        info.appendChild(line);
        var controls = document.createElement("div");
        controls.className = "cart-controls";
        var minus = document.createElement("button");
        minus.type = "button"; minus.className = "quantity-button"; minus.textContent = "−";
        minus.setAttribute("aria-label", "Decrease quantity for " + product.name);
        minus.addEventListener("click", function () { changeQuantity(product.id, -1); });
        var quantity = document.createElement("span");
        quantity.className = "quantity";
        quantity.textContent = state.cart[product.id];
        var plus = document.createElement("button");
        plus.type = "button"; plus.className = "quantity-button"; plus.textContent = "+";
        plus.setAttribute("aria-label", "Increase quantity for " + product.name);
        plus.addEventListener("click", function () { changeQuantity(product.id, 1); });
        var remove = document.createElement("button");
        remove.type = "button"; remove.className = "remove-button"; remove.textContent = "Remove";
        remove.setAttribute("aria-label", "Remove " + product.name + " from cart");
        remove.addEventListener("click", function () { removeItem(product.id); });
        controls.appendChild(minus); controls.appendChild(quantity); controls.appendChild(plus); controls.appendChild(remove);
        row.appendChild(info); row.appendChild(controls);
        cartItems.appendChild(row);
      });
      var message = "Hello wear90mins, I would like to order:%0A";
      items.forEach(function (product) {
        message += "- " + encodeURIComponent(product.name) + " x" + state.cart[product.id] + " — " + encodeURIComponent(formatMoney(product.price * state.cart[product.id])) + "%0A";
      });
      message += "%0ATotal: " + encodeURIComponent(formatMoney(total));
      whatsappOrder.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + message;
    }
    cartTotal.textContent = formatMoney(total);
  }
  function openDrawer() {
    lastFocused = document.activeElement;
    cartDrawer.hidden = false;
    backdrop.hidden = false;
    document.body.classList.add("drawer-open");
    closeCart.focus();
  }
  function closeDrawer() {
    cartDrawer.hidden = true;
    backdrop.hidden = true;
    document.body.classList.remove("drawer-open");
    if (lastFocused) lastFocused.focus();
  }
  function resetFilters() {
    state.query = ""; state.collection = ""; state.sort = "featured";
    if (searchInput) searchInput.value = "";
    if (collectionSelect) collectionSelect.value = "";
    if (sortSelect) sortSelect.value = "featured";
    renderProducts();
  }
  state.cart = safeGet();
  populateCollections();
  renderProducts();
  renderCart();
  if (searchInput) searchInput.addEventListener("input", function () { state.query = searchInput.value; renderProducts(); });
  if (collectionSelect) collectionSelect.addEventListener("change", function () { state.collection = collectionSelect.value; renderProducts(); });
  if (sortSelect) sortSelect.addEventListener("change", function () { state.sort = sortSelect.value; renderProducts(); });
  if (resetButton) resetButton.addEventListener("click", resetFilters);
  if (emptyReset) emptyReset.addEventListener("click", resetFilters);
  if (cartButton) cartButton.addEventListener("click", openDrawer);
  if (closeCart) closeCart.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !cartDrawer.hidden) closeDrawer();
  });
})();