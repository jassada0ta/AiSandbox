# Project Folder & File Structure

This document outlines the directory and file structure for the `my-marketplace-web` project. The structure strictly adheres to the project's governing principles, including a feature-based architecture, the View-Hook Pair pattern, and Trunk-based development with collocated tests.

## Root Directory Overview

```text
my-marketplace-web/
├── public/                     # Static assets that bypass Vite's build system
├── src/                        # Main source code directory
│   ├── assets/                 # Global assets (e.g., images, SVG icons, global styles if strictly necessary)
│   ├── features/               # Business feature modules (Core Architecture)
│   ├── App.jsx                 # Root application component (Layout & Routing via react-router-dom)
│   ├── App.test.jsx            # Unit test for App component
│   └── main.jsx                # Application entry point (Context Providers wrapping)
├── index.html                  # Vite entry HTML file
├── package.json                # Dependencies, scripts, and project metadata
├── vite.config.js              # Vite configuration file
├── vitest.config.js            # Vitest configuration for unit testing
├── oxlint.json                 # Oxlint configuration for code formatting/linting
└── README.md                   # Project overview and run instructions
```

## Feature-Based Folder Structure (`src/features/`)

All business logic, state, and UI components are grouped by **feature** rather than file type. Every feature directory contains sub-folders for its specific `api/`, `component/`, `context/`, and `hooks/`. 

Files follow the `kebab-case` naming convention and enforce the **Red-Green-Refactor** practice by keeping `.test.js` / `.test.jsx` files collocated with their target implementation files.

### 1. `user-authentication/`
```text
src/features/user-authentication/
├── component/
│   ├── login-modal-view.jsx
│   └── login-modal-view.test.jsx
├── context/
│   ├── auth-context.jsx
│   └── auth-context.test.jsx
└── hooks/
    ├── use-auth.js
    └── use-auth.test.js
```

### 2. `home-page-browse/`
```text
src/features/home-page-browse/
├── api/
│   ├── fetch-home-data.js
│   └── fetch-home-data.test.js
├── component/
│   ├── home-page-view.jsx
│   ├── home-page-view.test.jsx
│   ├── promotional-banner-view.jsx
│   ├── promotional-banner-view.test.jsx
│   ├── category-grid-view.jsx
│   ├── category-grid-view.test.jsx
│   ├── flash-sale-view.jsx
│   ├── flash-sale-view.test.jsx
│   ├── recommended-products-view.jsx
│   └── recommended-products-view.test.jsx
└── hooks/
    ├── use-home-page.js
    └── use-home-page.test.js
```

### 3. `product-search-and-filter/`
```text
src/features/product-search-and-filter/
├── api/
│   ├── fetch-search-results.js
│   └── fetch-search-results.test.js
├── component/
│   ├── search-results-view.jsx
│   ├── search-results-view.test.jsx
│   ├── search-bar-view.jsx
│   ├── search-bar-view.test.jsx
│   ├── filter-panel-view.jsx
│   ├── filter-panel-view.test.jsx
│   ├── sort-dropdown-view.jsx
│   └── sort-dropdown-view.test.jsx
└── hooks/
    ├── use-search.js
    └── use-search.test.js
```

### 4. `product-detail-page/`
```text
src/features/product-detail-page/
├── api/
│   ├── fetch-product-detail.js
│   └── fetch-product-detail.test.js
├── component/
│   ├── product-gallery-view.jsx
│   ├── product-gallery-view.test.jsx
│   ├── product-info-view.jsx
│   ├── product-info-view.test.jsx
│   ├── product-variations-view.jsx
│   ├── product-variations-view.test.jsx
│   ├── product-actions-view.jsx
│   └── product-actions-view.test.jsx
└── hooks/
    ├── use-product-detail.js
    └── use-product-detail.test.js
```

### 5. `shopping-cart/`
```text
src/features/shopping-cart/
├── component/
│   ├── cart-item-list-view.jsx
│   ├── cart-item-list-view.test.jsx
│   ├── cart-item-actions-view.jsx
│   ├── cart-item-actions-view.test.jsx
│   ├── voucher-input-view.jsx
│   ├── voucher-input-view.test.jsx
│   ├── order-summary-view.jsx
│   └── order-summary-view.test.jsx
├── context/
│   ├── cart-context.jsx
│   └── cart-context.test.jsx
└── hooks/
    ├── use-cart.js
    └── use-cart.test.js
```

### 6. `checkout-process/`
```text
src/features/checkout-process/
├── api/
│   ├── submit-order.js
│   └── submit-order.test.js
├── component/
│   ├── checkout-summary-view.jsx
│   ├── checkout-summary-view.test.jsx
│   ├── address-selection-view.jsx
│   ├── address-selection-view.test.jsx
│   ├── shipping-options-view.jsx
│   ├── shipping-options-view.test.jsx
│   ├── payment-methods-view.jsx
│   └── payment-methods-view.test.jsx
└── hooks/
    ├── use-checkout.js
    └── use-checkout.test.js
```

### 7. `order-management/`
```text
src/features/order-management/
├── api/
│   ├── fetch-orders.js
│   ├── fetch-orders.test.js
│   ├── update-order.js
│   └── update-order.test.js
├── component/
│   ├── order-tabs-view.jsx
│   ├── order-tabs-view.test.jsx
│   ├── order-list-view.jsx
│   ├── order-list-view.test.jsx
│   ├── order-detail-view.jsx
│   └── order-detail-view.test.jsx
└── hooks/
    ├── use-orders.js
    └── use-orders.test.js
```

### 8. `wishlist/`
```text
src/features/wishlist/
├── component/
│   ├── wishlist-page-view.jsx
│   ├── wishlist-page-view.test.jsx
│   ├── wishlist-toggle-view.jsx
│   └── wishlist-toggle-view.test.jsx
├── context/
│   ├── wishlist-context.jsx
│   └── wishlist-context.test.jsx
└── hooks/
    ├── use-wishlist.js
    └── use-wishlist.test.js
```

### 9. `product-reviews/`
```text
src/features/product-reviews/
├── api/
│   ├── submit-review.js
│   └── submit-review.test.js
├── component/
│   ├── review-modal-view.jsx
│   └── review-modal-view.test.jsx
└── hooks/
    ├── use-review.js
    └── use-review.test.js
```

## Shared UI / Global Component Guidelines

Any component that sits outside a specific feature (such as a global `header-component.jsx`, `footer-component.jsx`, or generic UI wrappers) should be placed in a top-level shared folder, e.g., `src/shared/component/`. 

```text
src/shared/
├── component/
│   ├── header-component.jsx
│   ├── header-component.test.jsx
│   ├── footer-component.jsx
│   └── footer-component.test.jsx
└── hooks/
    └── ...
```
