import { computed, Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ProductResponse } from '../product';

export interface HttpProductQueryParams {
  searchTerm: string;
  pageIndex: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class HttpProductService {
  private readonly baseUrl = 'https://dummyjson.com/products';

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly productsResource = httpResource<ProductResponse>(() => {
    const searchTerm = this.searchTerm().trim();
    const request = {
      url: searchTerm ? `${this.baseUrl}/search` : this.baseUrl,
      params: {
        limit: this.pageSize(),
        skip: this.pageIndex() * this.pageSize(),
        ...(searchTerm ? { q: searchTerm } : {}),
      },
    };

    return request;
  });

  readonly products = computed(
    () => this.productsResource.value()?.products ?? [],
  );
  readonly total = computed(() => this.productsResource.value()?.total ?? 0);
  readonly isLoading = this.productsResource.isLoading;
  readonly error = this.productsResource.error;
  readonly status = this.productsResource.status;

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