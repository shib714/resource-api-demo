import { computed, inject, Injectable, resource, signal } from '@angular/core';
import { ProductResponse } from '../product';
import { ProductQueryParams, ProductService } from './product.service';

/**
 * ProductStore (Facade / Feature Store)
 *
 * Centralizes reactive state management, asynchronous data fetching via Angular's resource() API,
 * and state mutation actions for product-related features.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductStore {
  private readonly productService = inject(ProductService);

  // ---------------------------------------------------------------------------
  // 1. Reactive State Signals (Writable / Internal)
  // ---------------------------------------------------------------------------
  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  // ---------------------------------------------------------------------------
  // 2. Resource coordinating async data fetching with reactive state signals
  // ---------------------------------------------------------------------------
  readonly productsResource = resource<ProductResponse, ProductQueryParams>({
    params: () => ({
      searchTerm: this.searchTerm(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    }),
    loader: ({ params, abortSignal }) =>
      this.productService.getProducts(params, abortSignal),
  });

  // ---------------------------------------------------------------------------
  // 3. Computed Selectors (Read-only signals for components)
  // ---------------------------------------------------------------------------
  readonly products = computed(
    () => this.productsResource.value()?.products ?? [],
  );
  readonly total = computed(
    () => this.productsResource.value()?.total ?? 0,
  );
  readonly isLoading = this.productsResource.isLoading;
  readonly error = this.productsResource.error;
  readonly status = this.productsResource.status;

  // ---------------------------------------------------------------------------
  // 4. Action Methods (State Mutations & Business Logic)
  // ---------------------------------------------------------------------------

  /**
   * Updates the search query and automatically resets the page index to 0.
   */
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
  }

  /**
   * Updates the pagination state.
   */
  setPage(pageIndex: number, pageSize: number): void {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
  }

  /**
   * Clears the active search query.
   */
  clearSearch(): void {
    this.setSearchTerm('');
  }

  /**
   * Forces the resource to reload with the current parameters.
   */
  reload(): void {
    this.productsResource.reload();
  }
}

