(function(){"use strict";var WHATSAPP_NUMBER="233505389974",STORE_KEY="wear90mins.cart.v1",SAVED_KEY="wear90mins.saved.v1";var products=window.WEAR90_PRODUCTS||[];var state={query:"",collection:"",sort:"featured",cart:{},saved:{}};var cartButton=document.getElementById("cartButton"),cartDrawer=document.getElementById("cartDrawer"),backdrop=document.getElementById("drawerBackdrop"),closeCart=document.getElementById("closeCart"),cartItems=document.getElementById("cartItems"),cartTotal=document.getElementById("cartTotal"),cartCount=document.getElementById("cartCount"),whatsappOrder=document.getElementById("whatsappOrder"),searchInput=document.getElementById("search"),collectionSelect=document.getElementById("collection"),sortSelect=document.getElementById("sort"),resetButton=document.getElementById("resetFilters"),emptyReset=document.getElementById("emptyReset"),productGrid=document.getElementById("productGrid"),emptyState=document.getElementById("emptyState"),resultCount=document.getElementById("resultCount"),progressBar=document.getElementById("deliveryProgress"),progressText=document.getElementById("progressText"),savedList=document.getElementById("savedList"),crossSell=document.getElementById("crossSell"),orderNotes=document.getElementById("orderNotes"),deliverySelect=document.getElementById("deliveryArea"),lastFocused=null;
function safeGet(k){try{return JSON.parse(localStorage.getItem(k)||"{}")}catch(e){return{}}}
function safeSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function money(a){return"GH₵"+a.toFixed(2)}
function byId(id){for(var i=0;i<products.length;i++)if(products[i].id===id)return products[i];return null}
function collections(){var s={},l=[];products.forEach(function(p){if(!s[p.collection]){s[p.collection]=1;l.push(p.collection)}});return l.sort()}
function fillCollections(){if(!collectionSelect)return;collections().forEach(function(n){var o=document.createElement("option");o.value=n;o.textContent=n;collectionSelect.appendChild(o)})}
function filtered(){var q=state.query.trim().toLowerCase();var list=products.filter(function(p){var mq=!q||(p.name+" "+p.collection).toLowerCase().indexOf(q)!==-1;var mc=!state.collection||p.collection===state.collection;return mq&&mc});
if(state.sort==="price-asc")list.sort(function(a,b){return a.price-b.price});
if(state.sort==="price-desc")list.sort(function(a,b){return b.price-a.price});
if(state.sort==="name")list.sort(function(a,b){return a.name.localeCompare(b.name)});
return list}
function renderProducts(){if(!productGrid)return;productGrid.textContent="";var list=filtered();resultCount.textContent=list.length+(list.length===1?" jersey":" jerseys");emptyState.hidden=list.length!==0;
list.forEach(function(p){var card=document.createElement("article");card.className="product-card";
var media=document.createElement("div");media.className="product-media";
var img=document.createElement("img");img.loading="lazy";img.decoding="async";img.src=p.photo;img.alt=p.alt;img.width=800;img.height=800;img.addEventListener("error",function(){if(p.fallback)img.src=p.fallback});media.appendChild(img);
if(p.soldOut){var b=document.createElement("p");b.className="badge";b.textContent="Sold out";media.appendChild(b)}
var body=document.createElement("div");body.className="product-body";
var c=document.createElement("p");c.className="product-collection";c.textContent=p.collection;
var t=document.createElement("h3");t.textContent=p.name;
var meta=document.createElement("p");meta.className="product-meta";meta.textContent=(p.kitType?p.kitType+" · ":"")+p.sleeve;
var price=document.createElement("p");price.className="price";price.textContent=money(p.price);
body.appendChild(c);body.appendChild(t);body.appendChild(meta);
if(p.result){var r=document.createElement("p");r.className="product-result";r.textContent=p.result;body.appendChild(r)}
body.appendChild(price);
var action=document.createElement("button");action.type="button";action.className=p.soldOut?"button disabled":"button primary";action.textContent=p.soldOut?"Sold out":"Add to cart";action.disabled=p.soldOut;
action.setAttribute("aria-label",p.soldOut?p.name+" is sold out":"Add "+p.name+" to cart");
if(!p.soldOut)action.addEventListener("click",function(){addToCart(p.id)});
body.appendChild(action);card.appendChild(media);card.appendChild(body);productGrid.appendChild(card)})}
function addToCart(id){state.cart[id]=(state.cart[id]||0)+1;delete state.saved[id];safeSet(STORE_KEY,state.cart);safeSet(SAVED_KEY,state.saved);renderCart();openDrawer()}
function changeQuantity(id,d){var n=(state.cart[id]||0)+d;if(n<=0)delete state.cart[id];else state.cart[id]=n;safeSet(STORE_KEY,state.cart);renderCart()}
function removeItem(id){delete state.cart[id];safeSet(STORE_KEY,state.cart);renderCart()}
function saveForLater(id){if(!state.cart[id])return;state.saved[id]=(state.saved[id]||0)+state.cart[id];delete state.cart[id];safeSet(STORE_KEY,state.cart);safeSet(SAVED_KEY,state.saved);renderCart()}
function moveToCart(id){if(!state.saved[id])return;state.cart[id]=(state.cart[id]||0)+state.saved[id];delete state.saved[id];safeSet(STORE_KEY,state.cart);safeSet(SAVED_KEY,state.saved);renderCart()}
function cartProducts(){return Object.keys(state.cart).map(byId).filter(Boolean)}
function deliveryFee(subtotal){if(!Object.keys(state.cart).length)return 0;if(deliverySelect&&deliverySelect.value==="outside")return null;if(subtotal>500)return 0;return 30}
function renderCart(){var items=cartProducts();var count=items.reduce(function(t,p){return t+state.cart[p.id]},0);var subtotal=items.reduce(function(t,p){return t+p.price*state.cart[p.id]},0);var fee=deliveryFee(subtotal);var total=fee===null?null:subtotal+fee;
cartCount.textContent=count;cartItems.textContent="";
if(!items.length){var e=document.createElement("p");e.className="empty-cart";e.textContent="Your cart is empty. Add a jersey to begin your order.";cartItems.appendChild(e)}
else{items.forEach(function(p){var row=document.createElement("div");row.className="cart-row";
var info=document.createElement("div");var n=document.createElement("p");n.className="cart-name";n.textContent=p.name;
var l=document.createElement("p");l.className="cart-line";l.textContent=money(p.price)+" each · "+(p.kitType?p.kitType+" · ":"")+p.sleeve;
info.appendChild(n);info.appendChild(l);
var controls=document.createElement("div");controls.className="cart-controls";
var minus=document.createElement("button");minus.type="button";minus.className="quantity-button";minus.textContent="−";minus.setAttribute("aria-label","Decrease quantity for "+p.name);minus.addEventListener("click",function(){changeQuantity(p.id,-1)});
var q=document.createElement("span");q.className="quantity";q.textContent=state.cart[p.id];
var plus=document.createElement("button");plus.type="button";plus.className="quantity-button";plus.textContent="+";plus.setAttribute("aria-label","Increase quantity for "+p.name);plus.addEventListener("click",function(){changeQuantity(p.id,1)});
var save=document.createElement("button");save.type="button";save.className="save-button";save.textContent="Save for later";save.setAttribute("aria-label","Save "+p.name+" for later");save.addEventListener("click",function(){saveForLater(p.id)});
var remove=document.createElement("button");remove.type="button";remove.className="remove-button";remove.textContent="Remove";remove.setAttribute("aria-label","Remove "+p.name+" from cart");remove.addEventListener("click",function(){removeItem(p.id)});
controls.appendChild(minus);controls.appendChild(q);controls.appendChild(plus);controls.appendChild(save);controls.appendChild(remove);
row.appendChild(info);row.appendChild(controls);cartItems.appendChild(row)})}
if(progressBar&&progressText){var pct=Math.min(100,(subtotal/500)*100);progressBar.value=pct;progressText.textContent=items.length?(subtotal>500?"Free delivery unlocked":"Add "+money(500-subtotal)+" more for free delivery"):"Add jerseys to begin";}
if(savedList){savedList.textContent="";var savedIds=Object.keys(state.saved);if(savedIds.length){var h=document.createElement("h3");h.textContent="Saved for later";savedList.appendChild(h);savedIds.forEach(function(id){var p=byId(id);if(!p)return;var row=document.createElement("div");row.className="saved-row";var name=document.createElement("p");name.textContent=p.name;var btn=document.createElement("button");btn.type="button";btn.className="button ghost";btn.textContent="Move to cart";btn.addEventListener("click",function(){moveToCart(id)});row.appendChild(name);row.appendChild(btn);savedList.appendChild(row)})}}
if(crossSell){crossSell.textContent="";var suggestion=pickCrossSell(items);if(suggestion){var h=document.createElement("h3");h.textContent="Complete your order";crossSell.appendChild(h);var row=document.createElement("div");row.className="crosssell-row";var name=document.createElement("p");name.textContent=suggestion.name;var price=document.createElement("p");price.className="price";price.textContent=money(suggestion.price);var btn=document.createElement("button");btn.type="button";btn.className="button primary";btn.textContent="Add to cart";btn.addEventListener("click",function(){addToCart(suggestion.id)});row.appendChild(name);row.appendChild(price);row.appendChild(btn);crossSell.appendChild(row)}}
var totalEl=document.getElementById("cartTotal");if(totalEl)totalEl.textContent=fee===null?"Calculated on WhatsApp":money(total);
var subtotalEl=document.getElementById("cartSubtotal");if(subtotalEl)subtotalEl.textContent=money(subtotal);
var feeEl=document.getElementById("cartDelivery");if(feeEl)feeEl.textContent=fee===null?"Calculated on WhatsApp":(fee===0?"Free":money(fee));
var msg="Hello wear90mins, I would like to order:%0A";
items.forEach(function(p){msg+="- "+encodeURIComponent(p.name+" ("+(p.kitType?p.kitType+", ":"")+p.sleeve+(state.cart[p.id]>0?"":"")+")")+" x"+state.cart[p.id]+" — "+encodeURIComponent(money(p.price*state.cart[p.id]))+"%0A"});
if(orderNotes&&orderNotes.value.trim())msg+="%0AOrder notes: "+encodeURIComponent(orderNotes.value.trim());
msg+="%0ASubtotal: "+encodeURIComponent(money(subtotal));
msg+="%0ADelivery: "+(fee===null?"Calculated on WhatsApp":(fee===0?"Free":encodeURIComponent(money(fee))));
if(fee!==null)msg+="%0ATotal: "+encodeURIComponent(money(total));
whatsappOrder.href="https://wa.me/"+WHATSAPP_NUMBER+"?text="+msg}
function pickCrossSell(items){if(!items.length)return null;var inCart={};items.forEach(function(p){inCart[p.id]=1});
var hasClub=items.some(function(p){return p.collection.indexOf("League")!==-1});
var hasNational=items.some(function(p){return p.collection==="National Teams"});
var hasGhana=items.some(function(p){return p.collection==="Ghana Tribute"});
var hasCustom=items.some(function(p){return p.collection==="Custom Print"});
var candidates=products.filter(function(p){return !inCart[p.id]&&!p.soldOut});
if(hasCustom)return candidates.find(function(p){return p.collection==="Custom Print"})||candidates[0];
if(hasGhana)return candidates.find(function(p){return p.collection==="Ghana Tribute"&&p.name.indexOf("Retro")!==-1})||candidates.find(function(p){return p.collection==="Ghana Tribute"})||candidates[0];
if(hasNational)return candidates.find(function(p){return p.collection==="World Cup Winners Retro"})||candidates[0];
if(hasClub)return candidates.find(function(p){return p.collection.indexOf("League")!==-1&&p.kitType==="Away"})||candidates.find(function(p){return p.collection.indexOf("League")!==-1})||candidates[0];
return candidates[0]}
function openDrawer(){lastFocused=document.activeElement;cartDrawer.hidden=false;backdrop.hidden=false;document.body.classList.add("drawer-open");closeCart.focus()}
function closeDrawer(){cartDrawer.hidden=true;backdrop.hidden=true;document.body.classList.remove("drawer-open");if(lastFocused)lastFocused.focus()}
function resetFilters(){state.query="";state.collection="";state.sort="featured";if(searchInput)searchInput.value="";if(collectionSelect)collectionSelect.value="";if(sortSelect)sortSelect.value="featured";renderProducts()}
state.cart=safeGet(STORE_KEY);state.saved=safeGet(SAVED_KEY);fillCollections();renderProducts();renderCart();
if(searchInput)searchInput.addEventListener("input",function(){state.query=searchInput.value;renderProducts()});
if(collectionSelect)collectionSelect.addEventListener("change",function(){state.collection=collectionSelect.value;renderProducts()});
if(sortSelect)sortSelect.addEventListener("change",function(){state.sort=sortSelect.value;renderProducts()});
if(resetButton)resetButton.addEventListener("click",resetFilters);
if(emptyReset)emptyReset.addEventListener("click",resetFilters);
if(cartButton)cartButton.addEventListener("click",openDrawer);
if(closeCart)closeCart.addEventListener("click",closeDrawer);
if(backdrop)backdrop.addEventListener("click",closeDrawer);
if(orderNotes)orderNotes.addEventListener("input",renderCart);
if(deliverySelect)deliverySelect.addEventListener("change",renderCart);
if(refreshFixtures)refreshFixtures.addEventListener("click",loadFixtures);
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!cartDrawer.hidden)closeDrawer()});
})();