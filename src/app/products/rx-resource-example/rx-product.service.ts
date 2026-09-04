import { computed, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { defer, from, Observable } from 'rxjs';
import { ProductResponse } from '../product';

export interface RxProductQueryParams {
  searchTerm: string;
  pageIndex: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class RxProductService {
  private readonly baseUrl = 'https://dummyjson.com/products';

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly productsResource = rxResource<ProductResponse, RxProductQueryParams>({
    params: () => ({
      searchTerm: this.searchTerm(),
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    }),
    stream: ({ params, abortSignal }) =>
      this.getProducts(params, abortSignal),
  });

  readonly products = computed(
    () => this.productsResource.value()?.products ?? [],
  );
  readonly total = computed(() => this.productsResource.value()?.total ?? 0);
  readonly isLoading = this.productsResource.isLoading;
  readonly error = this.productsResource.error;
  readonly status = this.productsResource.status;

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
}