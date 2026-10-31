# 001 - User Authentication & Account Modal

## User stories

* As a **shopper**, I want **to log in or sign up using my name and email or phone number**, so that **I can personalize my shopping session and proceed to checkout**.



## Acceptance criteria

* **AC-1** Given an unauthenticated shopper, when they click the "Login" button in the header, then a modal dialog opens with the title "Login or sign up".


* **AC-2** Given the login modal is open, when the user submits the form with empty "Name" or "Email or phone" fields, then invalid feedback text "Enter your name." or "Enter an email or phone number." is displayed.


* **AC-3** Given the user enters "Alex Chan" into "Name" and "alex@example.com" into "Email or phone", when they click "Login", then the modal closes, the header updates to display "Alex Chan", the topbar updates to "Hi, Alex Chan", and a toast displaying "Welcome, Alex Chan" appears.



---

# 002 - Product Search & Live Suggestions

## User stories

* As a **shopper**, I want **to search for products and see live suggestions as I type**, so that **I can quickly locate items without navigating through categories**.



## Acceptance criteria

* **AC-1** Given any page view, when the user types 2 or more characters into the header search input with placeholder "Search in Marketplace", then a dropdown list of matching search suggestions appears displaying product emoji, product title, and price.


* **AC-2** Given the search suggestion dropdown is open, when the user clicks a product suggestion item, then the dropdown closes, the search input clears, and the view navigates to that product's detail page (`#/product/:id`).


* **AC-3** Given a search term such as "headphones", when the user submits the search form, then the page navigates to `#/search?q=headphones`, showing header "Results for “headphones”" and the corresponding search result count.



---

# 003 - Home Page & Merchandising Banners

## User stories

* As a **shopper**, I want **to browse promotional banners, categories, flash sales, and recommended products on the home page**, so that **I can discover deals and featured products**.



## Acceptance criteria

* **AC-1** Given a user navigates to `#/home`, when the page loads, then a carousel banner featuring "Mega Sale Weekend", "Free Shipping", and "New Arrivals" is rendered alongside category tiles, a "⚡ Flash Sale" section with an active countdown timer, and a "Just For You" product grid.


* **AC-2** Given the "Just For You" section displays 12 products initially, when the user clicks "Load more", then 12 more products are appended to the product grid.


* **AC-3** Given all available products are displayed on the home page, when no further items can be loaded, then the "Load more" button is hidden and replaced with "That's all 22 products." text.



---

# 004 - Product Catalog Filtering & Sorting

## User stories

* As a **shopper**, I want **to filter and sort products by category, price, rating, shipping, and relevance**, so that **I can refine product lists to match my preferences**.



## Acceptance criteria

* **AC-1** Given the search view (`#/search`), when the user selects a category option (e.g., "Electronics"), then only products matching "Electronics" are rendered in the grid and the result count updates.


* **AC-2** Given the price range inputs "Min" and "Max" are set to "500" and "2000" respectively, when the user clicks "Apply", then only products with prices between ฿500 and ฿2,000 are displayed.


* **AC-3** Given active filter selections, when the user clicks "Clear (N)" or "Clear filters", then all filter criteria reset to default ("All categories", empty price range, "Any rating", free shipping disabled) and all catalog products are displayed.


* **AC-4** Given search results, when the user selects an option from the sort select dropdown (e.g., "Price: low to high"), then product cards are reordered in ascending price order.


* **AC-5** Given a mobile viewport width, when the user clicks "Filters", then an offcanvas filter drawer titled "Filters" opens containing the mobile filter options.



---

# 005 - Product Detail Page (PDP)

## User stories

* As a **shopper**, I want **to inspect product details, images, variations, seller information, and customer reviews**, so that **I can evaluate a product prior to purchasing**.



## Acceptance criteria

* **AC-1** Given a product with variation options (such as Colour or Size), when the user clicks a variation button (e.g., "Black" or "M"), then that button is marked as selected with `aria-pressed="true"`.


* **AC-2** Given a sold-out variation option (e.g., "XL" or "42"), when rendered on the page, then the variation button is disabled, styled with line-through text, and displays tooltip title "Sold out".


* **AC-3** Given a product page, when the user clicks "+" or "−" quantity buttons, then the quantity counter increments or decrements within the boundary of 1 and available stock.


* **AC-4** Given thumbnail images under the main gallery image, when the user clicks a thumbnail, then the main product gallery image updates to display the selected thumbnail view.


* **AC-5** Given a product page view, when rendered, then seller details ("TechHub Official", rating, shipping SLA), specifications table ("Brand", "Warranty", "Ships from", "SKU"), rating breakdown bars, written review list, and a "You may also like" related product section are shown.



---

# 006 - Wishlist & Saved Items

## User stories

* As a **shopper**, I want **to save items to my wishlist and review them later**, so that **I can keep track of items I plan to purchase**.



## Acceptance criteria

* **AC-1** Given a product card or PDP page, when the user clicks the wishlist heart button ("🤍"), then the button updates to "❤️", the header wishlist badge counter increments, and a toast displaying "Saved  to wishlist" appears.


* **AC-2** Given a saved wishlist product, when the user clicks the wishlist heart button ("❤️") again, then the item is removed from the wishlist, the header badge counter decrements, and a toast "Removed  from wishlist" appears.


* **AC-3** Given the wishlist contains no items, when the user navigates to `#/wishlist`, then the empty state message "Nothing saved yet. Tap the heart on any product." and a "Browse products" button are displayed.



---

# 007 - Shopping Cart Management

## User stories

* As a **shopper**, I want **to manage items in my cart, select items for checkout, and apply discount vouchers**, so that **I can review totals before ordering**.



## Acceptance criteria

* **AC-1** Given a product with unselected required variations (Colour or Size), when the user clicks "Add to cart" or "Buy now", then a toast displaying error "Choose a colour first." or "Choose a size first." is shown.


* **AC-2** Given selected variations and quantity, when the user clicks "Add to cart", then the item line is added to the cart, the cart header badge updates, and a toast "Added  to cart" is displayed.


* **AC-3** Given items in the cart grouped by seller, when the user checks or unchecks "Select all", then all item selection checkboxes in the cart update accordingly and order summary calculations recalculate.


* **AC-4** Given an item in the cart, when the user clicks "Delete", then the item is removed from the cart list and a toast "Item removed" appears.


* **AC-5** Given a valid voucher code "LAZ50" entered into the voucher input with subtotal ≥ ฿500, when the user clicks "Apply", then voucher chip "LAZ50" is displayed, a ฿50 discount is subtracted from the summary, and a toast "Voucher LAZ50 applied" appears.


* **AC-6** Given an invalid voucher code "INVALID", when the user clicks "Apply", then error text "“INVALID” is not a valid code." is displayed below the input.


* **AC-7** Given no items are selected in the cart, when viewing the cart summary, then the "Proceed to checkout (0)" button is disabled with text "Select at least one item to check out.".



---

# 008 - Delivery Address Management

## User stories

* As a **shopper**, I want **to add and select delivery addresses during checkout**, so that **my orders are delivered to the correct location**.



## Acceptance criteria

* **AC-1** Given the checkout view (`#/checkout`), when the user clicks "Add new", then a modal titled "Add a delivery address" opens.


* **AC-2** Given the address modal is open, when the user submits without completing required fields ("Full name", "Phone", "Address", "City / Province", "Postcode"), then form validation displays "Required." under each missing field.


* **AC-3** Given valid address inputs and label option "Work" selected, when the user clicks "Save address", then the modal closes, the address is saved, automatically selected as the active checkout address, and a toast "Address saved" appears.



---

# 009 - Checkout & Order Placement

## User stories

* As a **shopper**, I want **to pick shipping options, enter payment details, and place my order**, so that **I can complete my online purchase**.



## Acceptance criteria

* **AC-1** Given an unauthenticated user attempts to click "Proceed to checkout" or "Buy now", then the user is prompted with toast "Login to continue to checkout" and the login modal opens automatically.


* **AC-2** Given an order subtotal of ฿1,000 or greater, when "Standard delivery" shipping is selected, then the shipping fee is ฿0 ("Free").


* **AC-3** Given payment method "Credit / debit card" is selected, when card fields are incomplete or invalid (e.g., card number < 13 digits), then clicking "Place order · ฿" displays error text "Complete the card details — 13+ digit number, name, MM/YY and CVV.".


* **AC-4** Given a selected delivery address, shipping option, and valid payment method, when the user clicks "Place order · ฿", then a new order with status "To ship" is generated, selected cart items are removed from the cart, a toast "Order MP-XXXXXX placed" appears, and the view routes to `#/success/MP-XXXXXX`.



---

# 010 - Order Tracking & Lifecycle Management

## User stories

* As a **shopper**, I want **to view my order history, track order status updates, cancel orders, confirm receipt, and reorder past items**, so that **I can track and manage my purchases**.



## Acceptance criteria

* **AC-1** Given a completed order placement, when routed to `#/success/:id`, then header "Thank you, your order is placed", Order ID, total paid, payment label, estimated delivery date, and target city/postcode are displayed.


* **AC-2** Given the order history page (`#/orders`), when the user clicks status tabs ("All", "To ship", "Shipping", "To receive", "Completed", "Cancelled"), then only orders matching that tab's status are displayed.


* **AC-3** Given an order with status "to_ship", when the user clicks "Cancel order" on the order detail page (`#/order/:id`), then the order status changes to "Cancelled", displaying badge "Cancelled" and timeline state "Order cancelled" in red text.


* **AC-4** Given an order with status "to_receive", when the user clicks "Confirm receipt", then the status changes to "Completed", displaying badge "Completed" and toast "Delivery confirmed — you can review your items now".


* **AC-5** Given a completed or cancelled order, when the user clicks "Buy again", then all items from that order are added back into the shopping cart and the user is redirected to `#/cart`.



---

# 011 - Product Reviews & Rating Submission

## User stories

* As a **shopper**, I want **to submit star ratings and written reviews for items I bought**, so that **I can share my product feedback with other customers**.



## Acceptance criteria

* **AC-1** Given a product detail page or completed order item, when the user clicks "Write a review" or "Review", then a modal titled "Write a review" opens displaying star rating choices (5 ★ through 1 ★) and a review text area.


* **AC-2** Given the review modal is open, when the user submits without entering review text, then validation feedback "Write a few words before submitting." is displayed.


* **AC-3** Given a rating selection of 5 ★ and written review text, when the user clicks "Submit review", then the review is added to the top of the product's review list, the rating review count increments, the modal closes, and a toast "Thanks for your review" is shown.