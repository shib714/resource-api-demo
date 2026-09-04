# Angular `rxResource()` API Guide

This guide documents the RXJS-based product example in `src/app/products/rx-resource-example`. It uses Angular's `rxResource()` API with `HttpClient` to load paginated products from the DummyJSON API.

## 1. Prerequisites

The project uses Angular 22 and RxJS. Register `HttpClient` in `src/app/app.config.ts`:

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

Without `provideHttpClient()`, injecting `HttpClient` causes a `NullInjectorError` at runtime.

## 2. Why `rxResource()`?

`rxResource()` connects a reactive parameter function to an RxJS stream:

- Signal changes automatically trigger a new request.
- The stream result is exposed through reactive resource state.
- Previous requests are unsubscribed when parameters change.
- Components do not need to subscribe manually or use the `async` pipe.

The general shape is:

```typescript
const productsResource = rxResource<Response, Params>({
  params: () => params,
  stream: ({ params }) => observableRequest(params),
});
```

## 3. Define the query parameters

The RX service uses a typed parameter object for search and pagination:

```typescript
export interface RxProductQueryParams {
  searchTerm: string;
  pageIndex: number;
  pageSize: number;
}
```

The service owns the writable signals:

```typescript
readonly searchTerm = signal('');
readonly pageIndex = signal(0);
readonly pageSize = signal(10);
```

## 4. Configure `rxResource()`

Import `rxResource` from `@angular/core/rxjs-interop` and connect it to the signals:

```typescript
readonly productsResource = rxResource<
  ProductResponse,
  RxProductQueryParams
>({
  params: () => ({
    searchTerm: this.searchTerm(),
    pageIndex: this.pageIndex(),
    pageSize: this.pageSize(),
  }),
  stream: ({ params }) => this.getProducts(params),
});
```

Every signal read by `params` becomes a dependency. Updating `searchTerm`, `pageIndex`, or `pageSize` causes `rxResource` to call `getProducts()` again.

## 5. Option 1: Load with native `fetch()`

The original implementation wraps `fetch()` in an RxJS observable:

```typescript
import { defer, from, Observable } from 'rxjs';

getProducts(
  params: RxProductQueryParams,
  abortSignal?: AbortSignal,
): Observable<ProductResponse> {
  const query = params.searchTerm.trim();
  const limit = params.pageSize;
  const skip = params.pageIndex * params.pageSize;

  const endpoint = query
    ? `${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`
    : `${this.baseUrl}?limit=${limit}&skip=${skip}`;

  return defer(() =>
    from(
      fetch(endpoint, { signal: abortSignal }).then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch products: ${response.status} ${response.statusText}`,
          );
        }

        return (await response.json()) as ProductResponse;
      }),
    ),
  );
}
```

Important details:

- `defer()` starts the fetch when the observable is subscribed.
- `from()` converts the fetch promise into an observable.
- The `AbortSignal` cancels stale requests.
- `fetch()` requires manual status checking and JSON parsing.

The corresponding resource stream is:

```typescript
stream: ({ params, abortSignal }) =>
  this.getProducts(params, abortSignal),
```

## 6. Option 2: Load with Angular `HttpClient`

The current implementation uses Angular's typed `HttpClient`:

```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

private readonly http = inject(HttpClient);
```

Build query parameters with `HttpParams` instead of concatenating them into the URL:

```typescript
getProducts(params: RxProductQueryParams): Observable<ProductResponse> {
  const query = params.searchTerm.trim();

  let httpParams = new HttpParams()
    .set('limit', params.pageSize)
    .set('skip', params.pageIndex * params.pageSize);

  if (query) {
    httpParams = httpParams.set('q', query);
  }

  const endpoint = query ? `${this.baseUrl}/search` : this.baseUrl;

  return this.http.get<ProductResponse>(endpoint, {
    params: httpParams,
  });
}
```

Update the stream callback so it passes only the query parameters:

```typescript
stream: ({ params }) => this.getProducts(params),
```

`HttpClient` provides the following improvements over native `fetch()`:

- The response is typed as `ProductResponse`.
- JSON is parsed automatically.
- Non-success HTTP responses become observable errors.
- Unsubscribing cancels the underlying request.
- `HttpParams` handles URL encoding safely.

## 7. Expose template-friendly selectors

Keep the resource implementation inside the service and expose simple computed signals:

```typescript
readonly products = computed(
  () => this.productsResource.value()?.products ?? [],
);
readonly total = computed(() => this.productsResource.value()?.total ?? 0);
readonly isLoading = this.productsResource.isLoading;
readonly error = this.productsResource.error;
readonly status = this.productsResource.status;
```

The component and template should read these signals rather than call `getProducts()` directly. Calling a request method from a template can create repeated requests during change detection.

## 8. Service actions

The service updates the signals that drive `rxResource`:

```typescript
setSearchTerm(term: string): void {
  this.searchTerm.set(term);
  this.pageIndex.set(0);
}

setPage(pageIndex: number, pageSize: number): void {
  this.pageIndex.set(pageIndex);
  this.pageSize.set(pageSize);
}

clearSearch(): void {
  this.setSearchTerm('');
}

reload(): void {
  this.productsResource.reload();
}
```

Calling `setSearchTerm()` or `setPage()` automatically reloads the resource. `reload()` is useful for a retry button after an error.

## 9. Consume the service in the component

The RX list component injects the service:

```typescript
protected readonly store = inject(RxProductService);
```

The template reads signals directly:

```html
@if (store.isLoading()) {
  <p>Loading products...</p>
} @else if (store.error()) {
  <button mat-flat-button (click)="store.reload()">Retry</button>
} @else {
  @for (product of store.products(); track product.id) {
    <rx-product-card [product]="product" />
  }
}
```

Search and pagination update the service signals:

```html
<input
  matInput
  [ngModel]="store.searchTerm()"
  (ngModelChange)="store.setSearchTerm($event)"
/>

<mat-paginator
  [length]="store.total()"
  [pageSize]="store.pageSize()"
  [pageIndex]="store.pageIndex()"
  (page)="onPageChange($event)"
/>
```

## 10. RX example structure

The independent RX example is organized as follows:

```text
src/app/products/rx-resource-example/
  rx-product.service.ts
  rx-product-card/
    rx-product-card.ts
    rx-product-card.scss
  rx-product-list/
    rx-product-list.ts
    rx-product-list.html
    rx-product-list.scss
```

The `rx-product-list` route loads the RX example without importing the original `resource-example` components:

```typescript
{
  path: 'rx-product-list',
  loadComponent: () =>
    import(
      './products/rx-resource-example/rx-product-list/rx-product-list'
    ).then((m) => m.RxProductList),
  title: 'RxResource: Product List',
}
```

Open `/rx-product-list` to verify the RX implementation.

## 11. Resource state reference

| Signal or method | Purpose |
| --- | --- |
| `productsResource.value()` | Complete `ProductResponse` value |
| `productsResource.isLoading()` | Indicates an active request |
| `productsResource.error()` | Error from the request, if any |
| `productsResource.status()` | Current resource status |
| `productsResource.reload()` | Reloads with the current parameters |
| `products()` | Product array for the grid |
| `total()` | Total result count for pagination |

The template must invoke signal values with `()`, for example `store.products()` and `store.isLoading()`.
