# Implementation Tasks (Step-by-Step)

This document contains the detailed verifiable implementation tasks for `my-marketplace-web`. Tasks are assigned a unique ID (`T-XXX`), grouped by feature, and ordered by implementation sequence.

## 001-user-authentication
**Folder:** `src/features/user-authentication/`

**T-001: Write unit tests for `context/auth-context.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `context/auth-context.jsx`.
    2. Import `render` and `screen` from `@testing-library/react`.
    3. Create a dummy child component that consumes the context values.
    4. Wrap the dummy component in the Provider and assert the default state is provided correctly.
    5. Trigger a state update via the dummy component and verify the context state mutates properly.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `context/auth-context.jsx` fail (Red phase).

**T-002: Create `context/auth-context.jsx` to manage global user state.**
*   **Detail:**
    1. Create file `src/features/user-authentication/context/auth-context.jsx`.
    2. Import `createContext` and `useState` from React.
    3. Initialize `AuthContext` and export it.
    4. Create `AuthProvider` component with a `user` state initialized to `null`.
    5. Create `login(userData)` function that sets `user` state.
    6. Create `logout()` function that sets `user` to `null`.
    7. Return `<AuthContext.Provider>` passing `user`, `login`, and `logout`.
*   **Verification:**
    1. Open `src/main.jsx`.
    2. Import `AuthProvider` and wrap `<App />`.
    3. Run `npm run dev` and open the app.
    4. Check the browser console to ensure no rendering errors occur.

**T-003: Write unit tests for `hooks/use-auth.js`.**
*   **Detail:**
    1. Create `src/features/user-authentication/hooks/use-auth.test.js`.
    2. Import `describe`, `it`, `expect` from Vitest, and `renderHook` from testing-library/react.
    3. Write a test asserting an error is thrown if used outside `AuthProvider`.
    4. Write a test asserting `loginWithValidation` throws/returns an error if name or email is empty.
    5. Write a test asserting `loginWithValidation` calls the context's `login` successfully with valid data.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify that these specific tests fail (Red phase) because the hook is not implemented yet.

**T-004: Implement `hooks/use-auth.js`.**
*   **Detail:**
    1. Create file `src/features/user-authentication/hooks/use-auth.js`.
    2. Import `useContext` and `AuthContext`.
    3. Define `useAuth` hook that reads from `AuthContext`.
    4. Throw an error if the context value is undefined.
    5. Implement `loginWithValidation(name, email)` that validates inputs and calls context `login`.
    6. Return the context values alongside `loginWithValidation`.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify that the tests written in T-002 now pass (Green phase).

**T-005: Write unit tests for `component/login-modal-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/login-modal-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/login-modal-view.jsx` fail (Red phase).

**T-006: Create `component/login-modal-view.jsx`.**
*   **Detail:**
    1. Create file `src/features/user-authentication/component/login-modal-view.jsx`.
    2. Import `useAuth` hook.
    3. Define local state for `name` and `email`.
    4. Create a form using Bootstrap 5.3 modal structure (`modal`, `modal-dialog`, `modal-content`).
    5. Implement an `onSubmit` handler that prevents default and calls `loginWithValidation`.
    6. Bind inputs to local state and apply Bootstrap `was-validated` class on submit if inputs are empty.
*   **Verification:**
    1. Mount the component in a test view.
    2. Click the trigger to open the modal.
    3. Submit with empty fields and verify red validation text appears.
    4. Submit with valid text and verify the modal closes and context updates.

**T-007: Write unit tests for `header-component`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `header-component` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `header-component` fail (Red phase).

**T-008: Update main header layout to consume `auth-context`.**
*   **Detail:**
    1. Open the global header component file.
    2. Import `useAuth` and destructure the `user` object.
    3. Locate the "Login" button and "Guest" text in the JSX.
    4. Add a ternary operator: if `user` exists, display `user.name`; otherwise, display "Login" / "Guest".
*   **Verification:**
    1. Run the app in the browser.
    2. Open the login modal and submit valid credentials.
    3. Verify the header immediately changes from "Guest" to "Hi, [Name]".

**T-009: Implement local checks prompting unauthenticated users.**
*   **Detail:**
    1. Inside `use-auth.js`, export a new function `requireAuth(callback)`.
    2. If `user` is null, use Bootstrap's JS API to trigger the login modal.
    3. If `user` exists, execute `callback()`.
*   **Verification:**
    1. Attach `requireAuth(() => console.log('success'))` to a dummy button.
    2. Click the button while logged out; verify the modal opens.
    3. Log in, click the button again; verify 'success' logs to the console.

## 002-home-page-browse
**Folder:** `src/features/home-page-browse/`

**T-010: Write unit tests for `api/fetch-home-data.js`.**
*   **Detail:**
    1. Create a `.test.js` file for `api/fetch-home-data.js`.
    2. Import the API function and testing utilities from Vitest.
    3. Mock the global `fetch` API or internal timers (`vi.useFakeTimers()`) if it simulates network requests.
    4. Write a test asserting the function resolves with the correctly formatted mock data payload.
    5. Write a test asserting the function handles rejected responses or empty states gracefully.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `api/fetch-home-data.js` fail (Red phase).

**T-011: Create `api/fetch-home-data.js`.**
*   **Detail:**
    1. Create `src/features/home-page-browse/api/fetch-home-data.js`.
    2. Define an async function `fetchHomeData()`.
    3. Inside the function, construct a mocked JSON object containing `banners`, `categories`, `flashSale`, and `recommended` arrays based on the prototype.
    4. Use `setTimeout` wrapped in a Promise to simulate network delay.
    5. Return the mock object.
*   **Verification:**
    1. Write a temporary console.log script importing this function.
    2. Run the script and verify it prints the expected JSON structure after a short delay.

**T-012: Write unit tests for `hooks/use-home-page.js`.**
*   **Detail:**
    1. Create `use-home-page.test.js`.
    2. Mock the `fetchHomeData` API call.
    3. Test that initial state returns `isLoading: true`.
    4. Test that state updates with fetched data after API resolution.
    5. Test that calling `loadMore()` increments the visible limit of recommended products.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure the tests fail (Red phase).

**T-013: Implement `hooks/use-home-page.js`.**
*   **Detail:**
    1. Create `use-home-page.js`.
    2. Define `useState` for `data` (null), `isLoading` (true), and `visibleCount` (12).
    3. Add a `useEffect` that calls `fetchHomeData` on mount and updates the state.
    4. Create `loadMore()` function that sets `visibleCount(prev => prev + 12)`.
    5. Return `{ data, isLoading, visibleCount, loadMore }`.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure the tests pass (Green phase).

**T-014: Write unit tests for `component/promotional-banner-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/promotional-banner-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/promotional-banner-view.jsx` fail (Red phase).

**T-015: Create `component/promotional-banner-view.jsx`.**
*   **Detail:**
    1. Create `promotional-banner-view.jsx` accepting `banners` array as props.
    2. Implement Bootstrap `.carousel` and `.carousel-inner` divs.
    3. Map over `banners` to render `.carousel-item` divs.
    4. Add `.carousel-control-prev` and `.next` buttons.
*   **Verification:**
    1. Render the component in the main view.
    2. Verify banners automatically transition every few seconds.
    3. Click the arrows to ensure manual navigation works.

**T-016: Write unit tests for `component/category-grid-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/category-grid-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/category-grid-view.jsx` fail (Red phase).

**T-017: Create `component/category-grid-view.jsx`.**
*   **Detail:**
    1. Create `category-grid-view.jsx` accepting `categories` array as props.
    2. Map over the array to create a Bootstrap grid (`.row`, `.col-4.col-md-2`).
    3. Wrap each item in a `react-router-dom` `<Link>` pointing to `#/search?category=[id]`.
    4. Display the category emoji and name.
*   **Verification:**
    1. Render the component.
    2. Click a category tile.
    3. Verify the browser URL updates to the correct query parameter.

**T-018: Write unit tests for `component/flash-sale-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/flash-sale-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/flash-sale-view.jsx` fail (Red phase).

**T-019: Create `component/flash-sale-view.jsx`.**
*   **Detail:**
    1. Create `flash-sale-view.jsx` accepting `flashProducts` as props.
    2. Add a `useEffect` timer that updates a local `remainingTime` state every second.
    3. Render the countdown timer UI (`HH:MM:SS`).
    4. Render a horizontal grid of product cards for the passed `flashProducts`.
*   **Verification:**
    1. Render the component.
    2. Observe the timer decrementing by 1 second consistently.
    3. Verify flash sale items render correctly.

**T-020: Write unit tests for `component/recommended-products-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/recommended-products-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/recommended-products-view.jsx` fail (Red phase).

**T-021: Create `component/recommended-products-view.jsx`.**
*   **Detail:**
    1. Create `recommended-products-view.jsx` accepting `products`, `visibleCount`, and `loadMore` props.
    2. Slice the `products` array using `visibleCount`.
    3. Map over the sliced array to render standard product cards.
    4. Conditionally render the "Load more" button if `visibleCount < products.length`.
    5. Attach `onClick={loadMore}` to the button.
*   **Verification:**
    1. Render the component.
    2. Count the initial visible items (should be 12).
    3. Click "Load more" and verify the list expands to 24 items without a page reload.

**T-022: Write unit tests for `home-page-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `home-page-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `home-page-view.jsx` fail (Red phase).

**T-023: Assemble components into `home-page-view.jsx`.**
*   **Detail:**
    1. Create `home-page-view.jsx`.
    2. Call `useHomePage()`.
    3. If `isLoading` is true, render a spinner.
    4. If loaded, render the Banner, Category Grid, Flash Sale, and Recommended Products components, passing the required data.
*   **Verification:**
    1. Navigate to the base route `/`.
    2. Verify the entire assembled page loads, displays a brief loading state, and then renders all sections correctly formatted.

## 004-product-detail-page
**Folder:** `src/features/product-detail-page/`

**T-024: Write unit tests for `api/fetch-product-detail.js`.**
*   **Detail:**
    1. Create a `.test.js` file for `api/fetch-product-detail.js`.
    2. Import the API function and testing utilities from Vitest.
    3. Mock the global `fetch` API or internal timers (`vi.useFakeTimers()`) if it simulates network requests.
    4. Write a test asserting the function resolves with the correctly formatted mock data payload.
    5. Write a test asserting the function handles rejected responses or empty states gracefully.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `api/fetch-product-detail.js` fail (Red phase).

**T-025: Create `api/fetch-product-detail.js`.**
*   **Detail:**
    1. Create `api/fetch-product-detail.js`.
    2. Export async function `fetchProductDetail(productId)`.
    3. Search the mock product array for the matching ID.
    4. Wrap in a simulated Promise and return the product object (or throw 404 error if not found).
*   **Verification:**
    1. Write a test script calling `fetchProductDetail('p1')`.
    2. Verify the console logs the details of product 'p1'.

**T-026: Write unit tests for `hooks/use-product-detail.js`.**
*   **Detail:**
    1. Create `use-product-detail.test.js`.
    2. Test selecting a valid color and size updates the state.
    3. Test incrementing quantity stops at the `maxStock` limit.
    4. Test `validateSelection()` returns an error object if required variations are null.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure the tests fail (Red phase).

**T-027: Implement `hooks/use-product-detail.js`.**
*   **Detail:**
    1. Create `use-product-detail.js`.
    2. Define states: `color`, `size`, `qty` (default 1), `imageIndex` (default 0).
    3. Create handler functions: `setColor`, `setSize`, `setImageIndex`.
    4. Create `updateQty(delta)` checking limits against `product.stock`.
    5. Create `validateSelection()` returning errors if options are unselected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure all tests pass (Green phase).

**T-028: Write unit tests for `component/product-gallery-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/product-gallery-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/product-gallery-view.jsx` fail (Red phase).

**T-029: Create `component/product-gallery-view.jsx`.**
*   **Detail:**
    1. Create `product-gallery-view.jsx` accepting `product` and hook state.
    2. Render a large `<img src={product.images[imageIndex]}>`.
    3. Render a row of thumbnail images.
    4. Add `onClick={() => setImageIndex(index)}` to thumbnails.
*   **Verification:**
    1. Render on the PDP.
    2. Click the 3rd thumbnail.
    3. Verify the main image immediately updates to the 3rd image.

**T-030: Write unit tests for `component/product-info-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/product-info-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/product-info-view.jsx` fail (Red phase).

**T-031: Create `component/product-info-view.jsx`.**
*   **Detail:**
    1. Create `product-info-view.jsx` accepting `product`.
    2. Render the title (`h1`), rating breakdown, and sold count.
    3. Render `product.price` and `product.wasPrice` with strike-through styling.
    4. Render the seller name and badge from `product.seller`.
*   **Verification:**
    1. Load a product.
    2. Cross-reference the rendered title, price, and seller visually against the prototype design.

**T-032: Write unit tests for `component/product-variations-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/product-variations-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/product-variations-view.jsx` fail (Red phase).

**T-033: Create `component/product-variations-view.jsx`.**
*   **Detail:**
    1. Create `product-variations-view.jsx` accepting `product`, `color`, `size`, `setColor`, `setSize`.
    2. Map over `product.colors` to render buttons. Apply `aria-pressed` styling if selected.
    3. Map over `product.sizes` to render buttons.
    4. Disable size buttons if included in `product.soldOut` array.
*   **Verification:**
    1. Render the component.
    2. Try to click an out-of-stock size; verify it is unclickable.
    3. Click an available size; verify the active border/color style applies.

**T-034: Write unit tests for `component/product-actions-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/product-actions-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/product-actions-view.jsx` fail (Red phase).

**T-035: Create `component/product-actions-view.jsx`.**
*   **Detail:**
    1. Create `product-actions-view.jsx`.
    2. Render quantity minus/plus buttons bound to `updateQty`.
    3. Render "Add to cart" and "Buy now" buttons.
    4. On click, call `validateSelection()`. If error, show toast. If valid, dispatch to cart context.
*   **Verification:**
    1. Render the component.
    2. Click "Add to Cart" without selecting a size. Verify a red toast says "Choose a size first."
    3. Select a size, click again. Verify a green success toast appears.

## 003-product-search-and-filter
**Folder:** `src/features/product-search-and-filter/`

**T-036: Write unit tests for `api/fetch-search-results.js`.**
*   **Detail:**
    1. Create a `.test.js` file for `api/fetch-search-results.js`.
    2. Import the API function and testing utilities from Vitest.
    3. Mock the global `fetch` API or internal timers (`vi.useFakeTimers()`) if it simulates network requests.
    4. Write a test asserting the function resolves with the correctly formatted mock data payload.
    5. Write a test asserting the function handles rejected responses or empty states gracefully.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `api/fetch-search-results.js` fail (Red phase).

**T-037: Create `api/fetch-search-results.js`.**
*   **Detail:**
    1. Create `fetch-search-results.js`.
    2. Define async function accepting a filters object (`{query, category, minPrice, ...}`).
    3. Filter the local mock array based on the passed criteria.
    4. Apply sorting logic based on the `sort` parameter (e.g., price-asc).
    5. Return the modified array.
*   **Verification:**
    1. Run a test script passing `{ category: 'electronics', sort: 'price-asc' }`.
    2. Verify the returned array contains only electronics, ordered cheapest to most expensive.

**T-038: Write unit tests for `hooks/use-search.js`.**
*   **Detail:**
    1. Create `use-search.test.js`.
    2. Mock `react-router-dom`'s `useSearchParams`.
    3. Test that the hook extracts URL params into a usable filter state object.
    4. Test that `updateFilter('category', 'fashion')` correctly updates the search params.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure the tests fail (Red phase).

**T-039: Implement `hooks/use-search.js`.**
*   **Detail:**
    1. Create `use-search.js`.
    2. Import `useSearchParams` from `react-router-dom`.
    3. Parse the params into a `filters` object.
    4. Create `useEffect` to call `fetchSearchResults(filters)` whenever `filters` change, saving to `results` state.
    5. Create `updateFilter(key, value)` function that modifies `useSearchParams`.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure the tests pass (Green phase).

**T-040: Write unit tests for `component/search-bar-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/search-bar-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/search-bar-view.jsx` fail (Red phase).

**T-041: Create `component/search-bar-view.jsx`.**
*   **Detail:**
    1. Create `search-bar-view.jsx`.
    2. Define a text input bound to a local `term` state.
    3. Add an `onChange` handler that filters product titles if `term.length >= 2` to populate a `suggestions` array.
    4. Render the `suggestions` array as an absolutely positioned dropdown list.
    5. Add an `onSubmit` handler to navigate to `#/search?q={term}`.
*   **Verification:**
    1. Type "sh" in the header; verify no dropdown.
    2. Type "shoe"; verify dropdown appears with matches.
    3. Press Enter; verify navigation to search results page.

**T-042: Write unit tests for `component/filter-panel-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/filter-panel-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/filter-panel-view.jsx` fail (Red phase).

**T-043: Create `component/filter-panel-view.jsx`.**
*   **Detail:**
    1. Create `filter-panel-view.jsx` accepting `filters` and `updateFilter`.
    2. Render radio groups for Categories and Rating (`checked` if matches `filters` state).
    3. Render number inputs for `minPrice` and `maxPrice`, with an "Apply" button.
    4. Render a toggle switch for `freeShipping`.
    5. Attach `onChange` handlers to call `updateFilter` for radio/toggles, and `onClick` for price Apply.
*   **Verification:**
    1. Render on the search page.
    2. Click the "4 Stars & Up" radio.
    3. Verify the URL immediately appends `&rating=4` and the product grid updates.

**T-044: Write unit tests for `component/sort-dropdown-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/sort-dropdown-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/sort-dropdown-view.jsx` fail (Red phase).

**T-045: Create `component/sort-dropdown-view.jsx`.**
*   **Detail:**
    1. Create `sort-dropdown-view.jsx`.
    2. Render a `<select>` dropdown with options (Relevance, Price, Rating).
    3. Bind value to `filters.sort`.
    4. On `change`, call `updateFilter('sort', event.target.value)`.
*   **Verification:**
    1. Render above the search grid.
    2. Change selection to "Price: low to high".
    3. Verify the grid reorders to show the cheapest item first.

**T-046: Write unit tests for `component/search-results-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/search-results-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/search-results-view.jsx` fail (Red phase).

**T-047: Create `component/search-results-view.jsx`.**
*   **Detail:**
    1. Create `search-results-view.jsx` accepting `results`.
    2. If `results.length === 0`, render an empty state div with a "Clear filters" button (calls `setSearchParams({})`).
    3. Otherwise, map over `results` rendering product cards in a grid.
*   **Verification:**
    1. Search for a gibberish term (e.g., "xyz123").
    2. Verify the empty state renders.
    3. Click "Clear filters" and verify all products reappear.

## 005-shopping-cart
**Folder:** `src/features/shopping-cart/`

**T-048: Write unit tests for `context/cart-context.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `context/cart-context.jsx`.
    2. Import `render` and `screen` from `@testing-library/react`.
    3. Create a dummy child component that consumes the context values.
    4. Wrap the dummy component in the Provider and assert the default state is provided correctly.
    5. Trigger a state update via the dummy component and verify the context state mutates properly.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `context/cart-context.jsx` fail (Red phase).

**T-049: Create `context/cart-context.jsx`.**
*   **Detail:**
    1. Create `context/cart-context.jsx`.
    2. Define `CartContext` and `CartProvider`.
    3. Initialize state `items` as an empty array and `voucher` as null.
    4. Create dispatch functions: `addItem(item)`, `updateQty(id, qty)`, `removeItem(id)`, `toggleSelect(id)`, `applyVoucher(code)`.
    5. Export Provider.
*   **Verification:**
    1. Wrap `<App />` with `<CartProvider>`.
    2. Run app, check console for errors.

**T-050: Write unit tests for `hooks/use-cart.js`.**
*   **Detail:**
    1. Create `use-cart.test.js`.
    2. Write test: `addItem` groups duplicates by incrementing qty instead of pushing new objects.
    3. Write test: `subtotal` calculates only from items where `selected === true`.
    4. Write test: `applyVoucher` applies a percentage discount capped at the max limit.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests fail.

**T-051: Implement `hooks/use-cart.js`.**
*   **Detail:**
    1. Create `use-cart.js`.
    2. Read from `CartContext`.
    3. Use `useMemo` to calculate `subtotal`, `shippingFee` (based on subtotal > 1000 rule), `discount`, and `total`.
    4. Use `useMemo` to group `items` into a map grouped by `sellerId`.
    5. Return state, derived totals, and context actions.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests pass.

**T-052: Write unit tests for `component/cart-item-list-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/cart-item-list-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/cart-item-list-view.jsx` fail (Red phase).

**T-053: Create `component/cart-item-list-view.jsx`.**
*   **Detail:**
    1. Create `cart-item-list-view.jsx`.
    2. Map over the `groupedBySeller` array.
    3. Render a seller header block.
    4. Nested map over the items for that seller, rendering row details (image, name, variation).
    5. Bind a checkbox to `toggleSelect(item.id)`.
*   **Verification:**
    1. Add items from two different sellers to the cart.
    2. Open cart view. Verify items are separated under two distinct seller headers.
    3. Uncheck an item; verify visual state changes.

**T-054: Write unit tests for `component/cart-item-actions-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/cart-item-actions-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/cart-item-actions-view.jsx` fail (Red phase).

**T-055: Create `component/cart-item-actions-view.jsx`.**
*   **Detail:**
    1. Create `cart-item-actions-view.jsx` accepting a single `item`.
    2. Render minus/plus buttons calling `updateQty` (+1 or -1).
    3. Disable "+" if current qty >= `item.stock`.
    4. Render a "Delete" button calling `removeItem(item.id)`.
*   **Verification:**
    1. Click "+" on a cart item. Verify quantity text updates.
    2. Click "Delete". Verify item is removed from the cart list instantly.

**T-056: Write unit tests for `component/voucher-input-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/voucher-input-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/voucher-input-view.jsx` fail (Red phase).

**T-057: Create `component/voucher-input-view.jsx`.**
*   **Detail:**
    1. Create `voucher-input-view.jsx`.
    2. Render text input and "Apply" button.
    3. On submit, validate against a hardcoded voucher dictionary (e.g., `LAZ50`).
    4. If invalid, set local `error` state and render red text.
    5. If valid, call `applyVoucher(code)` and hide the input, showing a success chip instead.
*   **Verification:**
    1. Enter "FAKE" and click Apply. Verify error text shows.
    2. Enter "LAZ50". Verify input disappears, chip appears, and a success toast fires.

**T-058: Write unit tests for `component/order-summary-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/order-summary-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/order-summary-view.jsx` fail (Red phase).

**T-059: Create `component/order-summary-view.jsx`.**
*   **Detail:**
    1. Create `order-summary-view.jsx`.
    2. Read `subtotal`, `discount`, `shippingFee`, `total` from `useCart`.
    3. Render a breakdown table with these values.
    4. Render "Proceed to checkout" button. Add `disabled={selectedCount === 0}`.
*   **Verification:**
    1. Deselect all items in the cart.
    2. Verify the "Proceed" button greys out and becomes unclickable.
    3. Select an item; verify button activates and total reflects the item price.

## 006-checkout-process
**Folder:** `src/features/checkout-process/`

**T-060: Write unit tests for `api/submit-order.js`.**
*   **Detail:**
    1. Create a `.test.js` file for `api/submit-order.js`.
    2. Import the API function and testing utilities from Vitest.
    3. Mock the global `fetch` API or internal timers (`vi.useFakeTimers()`) if it simulates network requests.
    4. Write a test asserting the function resolves with the correctly formatted mock data payload.
    5. Write a test asserting the function handles rejected responses or empty states gracefully.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `api/submit-order.js` fail (Red phase).

**T-061: Create `api/submit-order.js`.**
*   **Detail:**
    1. Create `submit-order.js`.
    2. Define async function accepting `orderPayload`.
    3. Generate a random 6-digit ID (e.g., `MP-123456`).
    4. Simulate network delay via `setTimeout`.
    5. Return `{ success: true, orderId: "MP-123456" }`.
*   **Verification:**
    1. Run in test script. Verify it returns the success object with an ID after a brief delay.

**T-062: Write unit tests for `hooks/use-checkout.js`.**
*   **Detail:**
    1. Create `use-checkout.test.js`.
    2. Test validation logic: submitting without selecting an address throws an error.
    3. Test validation logic: if payment method is "card", submitting with a blank card number throws an error.
    4. Test state updates correctly for selecting shipping/payment.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests fail.

**T-063: Implement `hooks/use-checkout.js`.**
*   **Detail:**
    1. Create `use-checkout.js`.
    2. Define state for `addressId`, `shippingId`, `paymentId`, and `cardDetails` (object).
    3. Create `validateCheckout()` function applying the rules from T-037.
    4. Create `submitCheckout()` calling `submitOrder` API on successful validation.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests pass.

**T-064: Write unit tests for `component/address-selection-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/address-selection-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/address-selection-view.jsx` fail (Red phase).

**T-065: Create `component/address-selection-view.jsx`.**
*   **Detail:**
    1. Create `address-selection-view.jsx`.
    2. Render a list of user addresses as styled radio options bound to `addressId` state.
    3. Render an "Add new" button triggering a Bootstrap modal.
    4. Inside modal, render a form for name, phone, line, city, postcode. Save to local array on submit.
*   **Verification:**
    1. Open checkout view. Click "Add new".
    2. Fill form and submit. Verify modal closes and new address appears as a radio option.

**T-066: Write unit tests for `component/shipping-options-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/shipping-options-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/shipping-options-view.jsx` fail (Red phase).

**T-067: Create `component/shipping-options-view.jsx`.**
*   **Detail:**
    1. Create `shipping-options-view.jsx`.
    2. Render radio buttons for Standard and Express.
    3. Read `subtotal` from cart context. If `subtotal >= 1000`, display "Free" for Standard; otherwise display actual fee.
    4. Bind selection to `shippingId` state.
*   **Verification:**
    1. Ensure cart subtotal > 1000.
    2. Check the checkout view; verify Standard shipping displays as "Free".

**T-068: Write unit tests for `component/payment-methods-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/payment-methods-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/payment-methods-view.jsx` fail (Red phase).

**T-069: Create `component/payment-methods-view.jsx`.**
*   **Detail:**
    1. Create `payment-methods-view.jsx`.
    2. Render radio options for COD, Card, Wallet. Bind to `paymentId`.
    3. Add conditional block: `{paymentId === 'card' && <CardInputFields />}`.
    4. In `CardInputFields`, render 4 inputs bound to the `cardDetails` state.
*   **Verification:**
    1. Click "Cash on delivery". Verify card fields are hidden.
    2. Click "Credit/Debit card". Verify card fields slide/appear into view.

**T-070: Write unit tests for `component/checkout-summary-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/checkout-summary-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/checkout-summary-view.jsx` fail (Red phase).

**T-071: Create `component/checkout-summary-view.jsx`.**
*   **Detail:**
    1. Create `checkout-summary-view.jsx`.
    2. Render the final numeric breakdown.
    3. Render "Place order" button.
    4. Attach `onClick` to `submitCheckout()`. On success response, call React Router `navigate('/success/' + response.orderId)`.
*   **Verification:**
    1. Fill all required fields validly.
    2. Click "Place order".
    3. Verify the app navigates to the success route containing the generated order ID.

## 007-order-management
**Folder:** `src/features/order-management/`

**T-072: Write unit tests for `api/fetch-orders.js`.**
*   **Detail:**
    1. Create a `.test.js` file for `api/fetch-orders.js`.
    2. Import the API function and testing utilities from Vitest.
    3. Mock the global `fetch` API or internal timers (`vi.useFakeTimers()`) if it simulates network requests.
    4. Write a test asserting the function resolves with the correctly formatted mock data payload.
    5. Write a test asserting the function handles rejected responses or empty states gracefully.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `api/fetch-orders.js` fail (Red phase).

**T-073: Create `api/fetch-orders.js` and `api/update-order.js`.**
*   **Detail:**
    1. Create both API wrapper files.
    2. `fetchOrders()` returns a mocked array of past order objects.
    3. `updateOrder(id, status)` simulates an API PATCH request changing the order status string.
*   **Verification:**
    1. Run test scripts to ensure `fetchOrders` returns the array, and `updateOrder` correctly returns an object with the new status.

**T-074: Write unit tests for `hooks/use-orders.js`.**
*   **Detail:**
    1. Create `use-orders.test.js`.
    2. Test that `filteredOrders` array updates correctly based on the `activeTab` state.
    3. Test that calling `cancelOrder(id)` successfully updates the target order's status to 'cancelled' in the local state.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests fail.

**T-075: Implement `hooks/use-orders.js`.**
*   **Detail:**
    1. Create `use-orders.js`.
    2. Define `orders` state array and `activeTab` state string (default 'all').
    3. Add `useEffect` to fetch data on mount.
    4. Implement `filteredOrders` logic.
    5. Implement action handlers (`cancelOrder`, `confirmReceipt`, `reorderItems`).
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests pass.

**T-076: Write unit tests for `component/order-tabs-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/order-tabs-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/order-tabs-view.jsx` fail (Red phase).

**T-077: Create `component/order-tabs-view.jsx`.**
*   **Detail:**
    1. Create `order-tabs-view.jsx`.
    2. Render a `.nav.nav-tabs` unordered list.
    3. Map over predefined tab strings (All, To ship, etc.).
    4. Set `.active` class based on `activeTab` state.
    5. Render a badge counting orders per status.
*   **Verification:**
    1. Render on the Orders page.
    2. Click the "To ship" tab. Verify the active underline moves and only 'to_ship' orders display below.

**T-078: Write unit tests for `component/order-list-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/order-list-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/order-list-view.jsx` fail (Red phase).

**T-079: Create `component/order-list-view.jsx`.**
*   **Detail:**
    1. Create `order-list-view.jsx`.
    2. Map over `filteredOrders` to render summary cards.
    3. Render the order ID, status badge, thumbnails of items, and total price.
    4. Wrap the card in a `<Link>` or add a "View" button pointing to `#/order/:id`.
*   **Verification:**
    1. Verify cards render accurately based on the prototype UI.
    2. Click "View" on an order and verify navigation to the detail page.

**T-080: Write unit tests for `component/order-detail-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/order-detail-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/order-detail-view.jsx` fail (Red phase).

**T-081: Create `component/order-detail-view.jsx`.**
*   **Detail:**
    1. Create `order-detail-view.jsx`.
    2. Extract `:id` from URL params and fetch/find the specific order.
    3. Render the status timeline using an HTML unordered list with specific CSS classes (e.g., `.done`, `.current`).
    4. Render the delivery address, payment method, and itemized breakdown blocks.
*   **Verification:**
    1. Access an order detail page.
    2. Verify the timeline UI highlights the correct current step (e.g., green dot on "Shipping").

**T-082: Write unit tests for `order-status-actions`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `order-status-actions` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `order-status-actions` fail (Red phase).

**T-083: Implement order status actions.**
*   **Detail:**
    1. In `order-detail-view.jsx`, conditionally render action buttons.
    2. If `status === 'to_ship'`, render "Cancel order" bound to `cancelOrder(id)`.
    3. If `status === 'to_receive'`, render "Confirm receipt" bound to `confirmReceipt(id)`.
    4. If `status === 'completed'`, render "Buy again" bound to `reorderItems(order)`.
*   **Verification:**
    1. Open a 'to_receive' order.
    2. Click "Confirm receipt". Verify the timeline updates to "Completed" and the button disappears.

## 008-wishlist
**Folder:** `src/features/wishlist/`

**T-084: Write unit tests for `context/wishlist-context.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `context/wishlist-context.jsx`.
    2. Import `render` and `screen` from `@testing-library/react`.
    3. Create a dummy child component that consumes the context values.
    4. Wrap the dummy component in the Provider and assert the default state is provided correctly.
    5. Trigger a state update via the dummy component and verify the context state mutates properly.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `context/wishlist-context.jsx` fail (Red phase).

**T-085: Create `context/wishlist-context.jsx`.**
*   **Detail:**
    1. Create `context/wishlist-context.jsx`.
    2. Initialize state `savedIds` as a `Set` (or array).
    3. Create `toggle(id)` function: add if missing, remove if present.
    4. Export `WishlistProvider` and context.
*   **Verification:**
    1. Wrap `<App />` with `<WishlistProvider>`.
    2. Run app, verify no context errors in console.

**T-086: Write unit tests for `hooks/use-wishlist.js`.**
*   **Detail:**
    1. Create `use-wishlist.test.js`.
    2. Test that calling `toggle('p1')` adds 'p1' to the array.
    3. Test that calling `toggle('p1')` again removes it.
    4. Test that `isSaved('p1')` returns the correct boolean.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests fail.

**T-087: Implement `hooks/use-wishlist.js`.**
*   **Detail:**
    1. Create `use-wishlist.js`.
    2. Consume `WishlistContext`.
    3. Export `savedIds`, `toggle`, and a helper `isSaved = (id) => savedIds.has(id)`.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests pass.

**T-088: Write unit tests for `component/wishlist-toggle-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/wishlist-toggle-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/wishlist-toggle-view.jsx` fail (Red phase).

**T-089: Create `component/wishlist-toggle-view.jsx`.**
*   **Detail:**
    1. Create `wishlist-toggle-view.jsx` accepting `productId`.
    2. Read `isSaved(productId)` to determine icon state (❤️ or 🤍).
    3. Render a button with `onClick={() => toggle(productId)}`.
    4. Fire a toast notification indicating added/removed status.
*   **Verification:**
    1. Place component on a product card.
    2. Click the heart. Verify it turns solid red and a success toast appears.

**T-090: Write unit tests for `header-component`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `header-component` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `header-component` fail (Red phase).

**T-091: Update header to render a live badge count.**
*   **Detail:**
    1. Open global header component.
    2. Import `useWishlist` and extract `savedIds`.
    3. Render a Bootstrap `.badge` next to the Wishlist link displaying `savedIds.size`.
    4. Add a Bootstrap `.d-none` class condition if `savedIds.size === 0`.
*   **Verification:**
    1. Save 2 products.
    2. Verify the header badge displays '2'.
    3. Unsave them. Verify the badge disappears.

**T-092: Write unit tests for `component/wishlist-page-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/wishlist-page-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/wishlist-page-view.jsx` fail (Red phase).

**T-093: Create `component/wishlist-page-view.jsx`.**
*   **Detail:**
    1. Create `wishlist-page-view.jsx`.
    2. Fetch/filter the master products list to match IDs present in `savedIds`.
    3. Map the matched products to a grid.
    4. If `savedIds.size === 0`, render an empty state message with a link back to home.
*   **Verification:**
    1. Navigate to `/wishlist`.
    2. Ensure only saved products are displayed in the grid.
    3. Remove an item directly from this view. Verify it disappears immediately.

## 009-product-reviews
**Folder:** `src/features/product-reviews/`

**T-094: Write unit tests for `api/submit-review.js`.**
*   **Detail:**
    1. Create a `.test.js` file for `api/submit-review.js`.
    2. Import the API function and testing utilities from Vitest.
    3. Mock the global `fetch` API or internal timers (`vi.useFakeTimers()`) if it simulates network requests.
    4. Write a test asserting the function resolves with the correctly formatted mock data payload.
    5. Write a test asserting the function handles rejected responses or empty states gracefully.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `api/submit-review.js` fail (Red phase).

**T-095: Create `api/submit-review.js`.**
*   **Detail:**
    1. Create `submit-review.js`.
    2. Define async function accepting `productId`, `rating`, `text`, `author`.
    3. Simulate network delay via `setTimeout`.
    4. Return a success confirmation object.
*   **Verification:**
    1. Run in test script, passing mock review data.
    2. Verify successful resolution.

**T-096: Write unit tests for `hooks/use-review.js`.**
*   **Detail:**
    1. Create `use-review.test.js`.
    2. Test that submitting with rating 0 throws a validation error.
    3. Test that submitting with empty text throws a validation error.
    4. Test valid inputs successfully call the submit API.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests fail.

**T-097: Implement `hooks/use-review.js`.**
*   **Detail:**
    1. Create `use-review.js`.
    2. Define state for `rating` (default 5), `text` (default ''), and `isSubmitting`.
    3. Create `submitReview()` integrating validation logic and calling the API.
    4. Reset state on success.
*   **Verification:**
    1. Run `npx vitest`.
    2. Ensure tests pass.

**T-098: Write unit tests for `component/review-modal-view.jsx`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `component/review-modal-view.jsx` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `component/review-modal-view.jsx` fail (Red phase).

**T-099: Create `component/review-modal-view.jsx`.**
*   **Detail:**
    1. Create `review-modal-view.jsx`.
    2. Build a Bootstrap `.modal` structure.
    3. Add a hidden input or state tracking the target `productId`.
    4. Bind the close buttons to reset the form.
*   **Verification:**
    1. Mount component. Trigger it via a "Write review" button on the PDP.
    2. Verify modal opens cleanly over the existing UI.

**T-100: Write unit tests for `star-rating-inputs`.**
*   **Detail:**
    1. Create a `.test.jsx` file for `star-rating-inputs` alongside the implementation.
    2. Import `render`, `screen` from `@testing-library/react` and user event library.
    3. Mock any dependent hooks, context providers, and router components.
    4. Write a test asserting that the UI renders correctly without crashing.
    5. Write tests for user interactions (e.g., clicking buttons, typing in inputs) verifying they trigger the mocked functions as expected.
*   **Verification:**
    1. Run `npx vitest`.
    2. Verify the newly written tests for `star-rating-inputs` fail (Red phase).

**T-101: Implement star-rating radio group and text area.**
*   **Detail:**
    1. Inside the modal form, render 5 radio inputs wrapped in `.btn-group` styled as stars.
    2. Bind the radio `onChange` to update the hook's `rating` state.
    3. Render a `<textarea>` bound to the `text` state with `required` validation.
*   **Verification:**
    1. Open the modal. Click the '3 Stars' button. Verify styling updates.
    2. Submit with an empty text area. Verify the browser/Bootstrap blocks submission.

**T-102: Wire submission handler to update UI.**
*   **Detail:**
    1. Bind form `onSubmit` to `submitReview`.
    2. On promise resolution, use Bootstrap JS API to `.hide()` the modal.
    3. Fire a success toast.
    4. Trigger a re-render/refetch on the parent PDP so the new review renders immediately.
*   **Verification:**
    1. Fill out a valid 5-star review.
    2. Click Submit.
    3. Verify modal closes, toast appears, and the new review text is immediately visible at the top of the reviews list.
