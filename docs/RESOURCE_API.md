# Angular Resource API Guide (`resource()`)

This document provides a comprehensive guide and reference for the **Resource API (`resource()`)** in Angular, featuring the implementation in [`ProductList`](../src/app/products/resource-example/product-list/product-list.ts).

---

## 1. Overview

The `resource()` API is a declarative, signal-first bridge designed to coordinate asynchronous data fetching with Angular's reactive signal graph.

### Why Use `resource()`?
* **Declarative Reactivity**: Automatically initiates and re-triggers data fetches when input signals change.
* **Unified State**: Consolidates `value`, `isLoading`, `error`, and `status` into a single reactive object without managing separate signals manually.
* **Automatic Race Condition & Cancellation Handling**: Provides a standard DOM `AbortSignal` to cancel in-flight requests when parameters change rapidly or when the component is destroyed.
* **Zero Boilerplate**: Eliminates the need for manual `takeUntilDestroyed()`, RxJS subscription management, or `async` pipe overhead.

---

## 2. API Signature & Type Parameters

```typescript
import { resource, ResourceRef } from '@angular/core';

const myResource: ResourceRef<T> = resource<T, P>({
  params: () => P,
  loader: async ({ params, abortSignal, previous }) => Promise<T>,
});
```

### Type Parameters
* **`T` (`Product[]`)**: The resolved data payload type.
* **`P` (`{ searchTerm: string }`)**: The parameter payload type computed from dependent signals.

---

## 3. Configuration Options

### `params` (or `request`)
A reactive computation function (similar to `computed()`).
* **Dependency Tracking**: Tracks any signals read within its execution body (e.g., `this.searchTerm()`).
* **Trigger Mechanism**: Whenever any tracked signal emits a new value, `params` is re-evaluated and the `loader` is invoked with the new parameters.
* **Idle State**: If `params` returns `undefined`, the resource enters an `Idle` state without executing the loader.

### `loader`
An `async` function responsible for retrieving the data.
* **Arguments**:
  1. `params`: The latest evaluated result of the `params` function.
  2. `abortSignal`: A standard browser `AbortSignal` triggered when:
     * A new parameter is emitted before the current asynchronous operation completes.
     * The host component or injection context is destroyed.
  3. `previous`: Metadata containing the previous status and previously resolved value.

> [!TIP]
> Always pass `abortSignal` directly to your network request (e.g., `fetch(url, { signal: abortSignal })`). This automatically prevents outdated or out-of-order responses from overwriting newer search results.

---

## 4. `ResourceRef` Signals and Methods

The object returned by `resource()` exposes the following reactive signals and imperative methods:

### Signals (Read-Only)
| Member | Type | Description |
| :--- | :--- | :--- |
| `products.value()` | `Signal<T \| undefined>` | The current resolved data. Returns `undefined` before the first successful fetch. |
| `products.isLoading()` | `Signal<boolean>` | `true` while the resource is performing an initial fetch or reloading. |
| `products.error()` | `Signal<unknown>` | Contains the error or exception thrown during `loader` execution (`undefined` if no error). |
| `products.status()` | `Signal<ResourceStatus>` | Fine-grained status enum: `Idle`, `Loading`, `Resolved`, `Error`, `Reloading`, `Local`. |

### Imperative Methods
| Method | Signature | Description |
| :--- | :--- | :--- |
| `products.reload()` | `() => boolean` | Imperatively forces the loader to re-fetch data with current parameters (useful for "Retry" buttons). |
| `products.set(val)` | `(value: T) => void` | Manually updates the local value without invoking the `loader`. |
| `products.update(fn)` | `(updater: (prev: T) => T) => void` | Updates the local value based on current value (useful for optimistic UI updates). |
| `products.destroy()` | `() => void` | Cancels any pending loaders and disposes of the resource. |

---

## 5. Complete Implementation Reference

### TypeScript Component: [`product-list.ts`](../src/app/products/resource-example/product-list/product-list.ts)

```typescript
import { ChangeDetectionStrategy, Component, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Product, ProductResponse } from '../../product';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'product-list',
  imports: [
    ProductCard,
    MatIconModule,
import { ChangeDetectionStrategy, Component, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductResponse } from '../../product';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'product-list',
  imports: [
    ProductCard,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  protected readonly url = 'https://dummyjson.com/products';
  protected readonly searchTerm = signal('');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(12);

  // 1. Declare Resource with multi-signal reactive parameters
  products = resource<ProductResponse, { searchTerm: string; pageIndex: number; pageSize: number }>({
    params: () => ({
      searchTerm: this.searchTerm(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    }),
    loader: async ({ params, abortSignal }) => {
      const query = params.searchTerm.trim();
      const limit = params.pageSize;
      const skip = params.pageIndex * params.pageSize;

      const endpoint = query
        ? `${this.url}/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`
        : `${this.url}?limit=${limit}&skip=${skip}`;

      // 2. Pass abortSignal to fetch for auto-cancellation
      const response = await fetch(endpoint, { signal: abortSignal });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    },
  });

  protected onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.pageIndex.set(0); // Reset page on search change
  }

  protected onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected clearSearch() {
    this.searchTerm.set('');
    this.pageIndex.set(0);
  }
}
```

### HTML Template:

```html
<div class="products-container">
  <!-- Search Input -->
  <mat-form-field appearance="outline" class="search-field">
    <mat-label>Search Products</mat-label>
    <input
      matInput
      [ngModel]="searchTerm()"
      (ngModelChange)="onSearchChange($event)"
      placeholder="e.g. mascara, phone, perfume"
    />
    @if (searchTerm()) {
      <button mat-icon-button matSuffix (click)="clearSearch()" aria-label="Clear search">
        <mat-icon>close</mat-icon>
      </button>
    }
  </mat-form-field>

  <!-- State 1: Loading -->
  @if (products.isLoading()) {
    <div class="loading-state">
      <mat-spinner diameter="48"></mat-spinner>
      <p>Loading products...</p>
    </div>
  }

  <!-- State 2: Error with Retry -->
  @else if (products.error()) {
    <div class="error-state">
      <mat-icon>error_outline</mat-icon>
      <p>Failed to load products</p>
      <button mat-flat-button (click)="products.reload()">Retry</button>
    </div>
  }

  <!-- State 3: Resolved Data Grid & Paginator -->
  @else {
    <div class="products-grid">
      @for (product of products.value()?.products; track product.id) {
        <product-card [product]="product" />
      } @empty {
        <div class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          <p>No products match your search</p>
        </div>
      }
    </div>

    @if ((products.value()?.total ?? 0) > 0) {
      <mat-paginator
        [length]="products.value()?.total ?? 0"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex()"
        [pageSizeOptions]="[6, 12, 24, 48]"
        [showFirstLastButtons]="true"
        (page)="onPageChange($event)"
        aria-label="Select page of products"
      >
      </mat-paginator>
    }
  }
</div>
```

---

## 6. Comparison: `resource` vs `httpResource` vs `rxResource`

| Feature | `resource()` | `httpResource()` | `rxResource()` |
| :--- | :--- | :--- | :--- |
| **Package** | `@angular/core` | `@angular/common/http` | `@angular/core/rxjs-interop` |
| **Async Mechanism** | `Promise` / `fetch` | Angular `HttpClient` | RxJS `Observable` |
| **Interceptors Support** | Manual | Automatic via `HttpClient` | Automatic if using `HttpClient` |
| **Cancellation** | via `AbortSignal` | Automatic on parameter change | Automatic via RxJS unsubscribe |
| **Best For** | Generic Promises, `fetch`, SDKs | Standard REST endpoints in Angular apps | Complex event streams, debouncing, polling |

